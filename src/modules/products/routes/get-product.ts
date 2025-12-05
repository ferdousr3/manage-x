import { createRoute } from '@hono/zod-openapi'
import { OK, NOT_FOUND } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { zId, zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectProduct } from '../products.schema'
import { findProductById } from '../products.service'

export const getProductRoute = createRoute({
   path: '/api/v1/products/{id}',
   method: 'get',
   tags: ['Products'],
   // Public route - no auth required
   request: {
      params: zId,
   },
   responses: {
      [OK]: ApiResponse(zSelectProduct, 'Product found'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Product not found'),
   },
})

export const getProductHandler: AppRouteHandler<typeof getProductRoute> = async (c) => {
   const { id } = c.req.valid('param')
   const product = await findProductById(id)

   if (!product) {
      return c.json(
         { message: 'Product not found', data: {}, success: false },
         NOT_FOUND
      )
   }

   return c.json(
      { data: product, message: 'Product found', success: true },
      OK
   )
}
