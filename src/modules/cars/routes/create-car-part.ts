import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zInsertCarPart, zSelectCarPart } from '../cars.schema'
import { createCarPart } from '../cars.service'

export const createCarPartRoute = createRoute({
   path: '/v1/cars/parts',
   method: 'post',
   tags: ['Cars'],
   middleware: [checkToken] as const,
   request: {
      body: jsonContent(zInsertCarPart, 'Car part details'),
   },
   responses: {
      [CREATED]: ApiResponse(zSelectCarPart, 'Car part created successfully'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid car part data'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const createCarPartHandler: AppRouteHandler<typeof createCarPartRoute> = async (c) => {
   const body = c.req.valid('json')

   try {
      const [newPart] = await createCarPart(body)

      return c.json(
         {
            data: newPart,
            message: 'Car part created successfully',
            success: true,
         },
         CREATED
      )
   } catch (error) {
      console.error('Error creating car part:', error instanceof Error ? error.message : 'Unknown error')
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
