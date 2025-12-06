import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zInsertCar, zSelectCar } from '../cars.schema'
import { createCar } from '../cars.service'

export const createCarRoute = createRoute({
   path: '/v1/cars',
   method: 'post',
   tags: ['Cars'],
   middleware: [checkToken] as const,
   request: {
      body: jsonContent(zInsertCar, 'Car details'),
   },
   responses: {
      [CREATED]: ApiResponse(zSelectCar, 'Car created successfully'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid car data'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const createCarHandler: AppRouteHandler<typeof createCarRoute> = async (c) => {
   const body = c.req.valid('json')
   const payload = c.get('jwtPayload')

   try {
      const [newCar] = await createCar({
         ...body,
         creatorId: payload.sub,
      })

      return c.json(
         {
            data: newCar,
            message: 'Car created successfully',
            success: true,
         },
         CREATED
      )
   } catch (error) {
      console.error('Error creating car:', error instanceof Error ? error.message : 'Unknown error')
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
