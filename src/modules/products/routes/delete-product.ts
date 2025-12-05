import { createRoute } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zId, zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { findProductById, deleteProduct } from '../products.service'

export const deleteProductRoute = createRoute({
   path: '/api/v1/products/{id}',
   method: 'delete',
   tags: ['Products'],
   middleware: [checkToken] as const,
   request: {
      params: zId,
   },
   responses: {
      [OK]: ApiResponse(zEmpty, 'Product deleted successfully'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Product not found'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const deleteProductHandler: AppRouteHandler<typeof deleteProductRoute> = async (c) => {
   const { id } = c.req.valid('param')

   try {
      const product = await findProductById(id)
      if (!product) {
         return c.json(
            { data: {}, message: 'Product not found', success: false },
            NOT_FOUND
         )
      }

      await deleteProduct(id)

      return c.json(
         { data: {}, message: 'Product deleted successfully', success: true },
         OK
      )
   } catch (error) {
      console.error('Error deleting product:', error instanceof Error ? error.message : 'Unknown error')
      return c.json(
         { data: {}, message: 'Internal Server Error', success: false },
         INTERNAL_SERVER_ERROR
      )
   }
}
