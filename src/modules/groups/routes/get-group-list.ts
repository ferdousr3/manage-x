import { createRoute, z } from '@hono/zod-openapi'
import { OK, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmptyList } from '../../../core/models/common.schema'
import { ApiPaginatedResponse } from '../../../core/utils/api-response.util'
import { zSelectGroup } from '../groups.schema'
import { findManyGroups, countGroups } from '../groups.service'

export const getGroupsRoute = createRoute({
   path: '/api/v1/groups',
   method: 'get',
   tags: ['Groups'],
   middleware: [checkToken] as const,
   request: {
      query: z.object({
         search: z.string().optional(),
         page: z.coerce.number().optional().default(1),
         size: z.coerce.number().optional().default(10),
      }),
   },
   responses: {
      [OK]: ApiPaginatedResponse(zSelectGroup, 'List of Groups'),
      [INTERNAL_SERVER_ERROR]: ApiPaginatedResponse(zEmptyList, 'Internal server error'),
   },
})

export const getGroupsHandler: AppRouteHandler<typeof getGroupsRoute> = async (c) => {
   try {
      const { search, page, size } = c.req.valid('query')

      const pageNumber = page || 1
      const limitNumber = size || 10

      const data = await findManyGroups(
         { search },
         limitNumber,
         (pageNumber - 1) * limitNumber
      )

      const total = await countGroups({ search })

      return c.json(
         {
            data,
            pagination: {
               page: pageNumber,
               size: limitNumber,
               total,
            },
            message: 'Group list',
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
