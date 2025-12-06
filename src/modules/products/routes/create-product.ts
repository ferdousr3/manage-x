import { createRoute } from '@hono/zod-openapi'
import { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zInsertProduct, zSelectProduct } from '../products.schema'
import { createProduct } from '../products.service'

export const createProductRoute = createRoute({
   path: '/v1/products',
   method: 'post',
   tags: ['Products'],
   middleware: [checkToken] as const,
   request: {
      body: jsonContent(zInsertProduct, 'Product details'),
   },
   responses: {
      [CREATED]: ApiResponse(zSelectProduct, 'Product created successfully'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid product data'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const createProductHandler: AppRouteHandler<typeof createProductRoute> = async (c) => {
   const body = c.req.valid('json')
   const payload = c.get('jwtPayload')

   try {
      const [newProduct] = await createProduct({
         ...body,
         creatorId: payload.sub,
      })

      return c.json(
         {
            data: newProduct,
            message: 'Product created successfully',
            success: true,
         },
         CREATED
      )
   } catch (error) {
      console.error('Error creating product:', error instanceof Error ? error.message : 'Unknown error')
      return c.json(
         {
            data: {},
            message: 'Internal Server Error',
            success: false,
         },
         INTERNAL_SERVER_ERROR
      )
   }
}
