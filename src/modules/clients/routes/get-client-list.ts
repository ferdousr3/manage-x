import { createRoute, z } from '@hono/zod-openapi'
import { OK, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmptyList } from '../../../core/models/common.schema'
import { ApiPaginatedResponse } from '../../../core/utils/api-response.util'
import { zSelectClient } from '../clients.schema'
import { findManyClients, countClients } from '../clients.service'

export const getClientsRoute = createRoute({
   path: '/api/v1/clients',
   method: 'get',
   tags: ['Clients'],
   middleware: [checkToken] as const,
   request: {
      query: z.object({
         search: z.string().optional(),
         page: z.coerce.number().optional().default(1),
         size: z.coerce.number().optional().default(10),
         groupId: z.string().optional(),
      }),
   },
   responses: {
      [OK]: ApiPaginatedResponse(zSelectClient, 'List of Clients'),
      [INTERNAL_SERVER_ERROR]: ApiPaginatedResponse(zEmptyList, 'Internal server error'),
   },
})

export const getClientsHandler: AppRouteHandler<typeof getClientsRoute> = async (c) => {
   try {
      const { search, page, size, groupId } = c.req.valid('query')

      const pageNumber = page || 1
      const limitNumber = size || 10

      const data = await findManyClients(
         { search, groupId },
         limitNumber,
         (pageNumber - 1) * limitNumber
      )

      const total = await countClients({ search, groupId })

      return c.json(
         {
            data,
            pagination: {
               page: pageNumber,
               size: limitNumber,
               total,
            },
            message: 'Client list',
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
