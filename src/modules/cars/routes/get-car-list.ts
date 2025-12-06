import { createRoute, z } from '@hono/zod-openapi'
import { OK, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { zEmptyList } from '../../../core/models/common.schema'
import { ApiPaginatedResponse } from '../../../core/utils/api-response.util'
import { zSelectCar } from '../cars.schema'
import { findManyCars, countCars } from '../cars.service'

export const getCarsRoute = createRoute({
   path: '/v1/cars',
   method: 'get',
   tags: ['Cars'],
   request: {
      query: z.object({
         search: z.string().optional(),
         brand: z.string().optional(),
         page: z.coerce.number().optional().default(1),
         size: z.coerce.number().optional().default(10),
      }),
   },
   responses: {
      [OK]: ApiPaginatedResponse(zSelectCar, 'List of Cars'),
      [INTERNAL_SERVER_ERROR]: ApiPaginatedResponse(zEmptyList, 'Internal server error'),
   },
})

export const getCarsHandler: AppRouteHandler<typeof getCarsRoute> = async (c) => {
   try {
      const { search, brand, page, size } = c.req.valid('query')

      const pageNumber = page || 1
      const limitNumber = size || 10

      const data = await findManyCars(
         { search, brand },
         limitNumber,
         (pageNumber - 1) * limitNumber
      )

      const total = await countCars({ search, brand })

      return c.json(
         {
            data,
            pagination: {
               page: pageNumber,
               size: limitNumber,
               total,
            },
            message: 'Car list',
            success: true,
         },
         OK
      )
   } catch (error) {
      return c.json(
         {
            data: [],
            pagination: { page: 1, size: 10, total: 0 },
            message: 'Internal server error',
            success: false,
         },
         INTERNAL_SERVER_ERROR
      )
   }
}
