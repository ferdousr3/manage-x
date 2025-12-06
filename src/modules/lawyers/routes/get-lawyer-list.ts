import { createRoute, z } from '@hono/zod-openapi'
import { OK, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { zEmptyList } from '../../../core/models/common.schema'
import { ApiPaginatedResponse } from '../../../core/utils/api-response.util'
import { zSelectLawyer } from '../lawyers.schema'
import { findManyLawyers, countLawyers } from '../lawyers.service'

export const getLawyersRoute = createRoute({
   path: '/v1/lawyers',
   method: 'get',
   tags: ['Lawyers'],
   // Public route - no auth required
   request: {
      query: z.object({
         search: z.string().optional(),
         page: z.coerce.number().optional().default(1),
         size: z.coerce.number().optional().default(10),
         type: z.string().optional(),
         district: z.string().optional(),
         status: z.enum(['pending', 'approved', 'hidden']).optional(),
      }),
   },
   responses: {
      [OK]: ApiPaginatedResponse(zSelectLawyer, 'List of Lawyers'),
      [INTERNAL_SERVER_ERROR]: ApiPaginatedResponse(zEmptyList, 'Internal server error'),
   },
})

export const getLawyersHandler: AppRouteHandler<typeof getLawyersRoute> = async (c) => {
   try {
      const { search, page, size, type, district, status } = c.req.valid('query')

      const pageNumber = page || 1
      const limitNumber = size || 10

      const data = await findManyLawyers(
         { search, type, district, status },
         limitNumber,
         (pageNumber - 1) * limitNumber
      )

      const total = await countLawyers({ search, type, district, status })

      return c.json(
         {
            data,
            pagination: {
               page: pageNumber,
               size: limitNumber,
               total,
            },
            message: 'Lawyer list',
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
