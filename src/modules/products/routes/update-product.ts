import { createRoute } from '@hono/zod-openapi'
import { OK, NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zId, zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectProduct, zUpdateProduct } from '../products.schema'
import { findProductById, updateProduct } from '../products.service'

export const updateProductRoute = createRoute({
   path: '/v1/products/{id}',
   method: 'patch',
   tags: ['Products'],
   middleware: [checkToken] as const,
   request: {
      params: zId,
      body: jsonContent(zUpdateProduct, 'Product update details'),
   },
   responses: {
      [OK]: ApiResponse(zSelectProduct, 'Product updated successfully'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid product data'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Product not found'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const updateProductHandler: AppRouteHandler<typeof updateProductRoute> = async (c) => {
   const { id } = c.req.valid('param')
   const body = c.req.valid('json')

   try {
      const existingProduct = await findProductById(id)
      if (!existingProduct) {
         return c.json(
            { data: {}, message: 'Product not found', success: false },
            NOT_FOUND
         )
      }

      const [updatedProduct] = await updateProduct(id, body)

      return c.json(
         {
            data: updatedProduct,
            message: 'Product updated successfully',
            success: true,
         },
         OK
      )
   } catch (error) {
      console.error('Error updating product:', error instanceof Error ? error.message : 'Unknown error')
      return c.json(
         { data: {}, message: 'Internal Server Error', success: false },
         INTERNAL_SERVER_ERROR
      )
   }
}
