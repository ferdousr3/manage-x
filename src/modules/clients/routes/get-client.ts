import { createRoute } from '@hono/zod-openapi'
import { OK, NOT_FOUND } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zId, zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectClient } from '../clients.schema'
import { findClientById } from '../clients.service'

export const getClientRoute = createRoute({
   path: '/api/v1/clients/{id}',
   method: 'get',
   tags: ['Clients'],
   middleware: [checkToken] as const,
   request: {
      params: zId,
   },
   responses: {
      [OK]: ApiResponse(zSelectClient, 'Client found'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Client not found'),
   },
})

export const getClientHandler: AppRouteHandler<typeof getClientRoute> = async (c) => {
   const { id } = c.req.valid('param')
   const client = await findClientById(id)

   if (!client) {
      return c.json(
         { message: 'Client not found', data: {}, success: false },
         NOT_FOUND
      )
   }

   return c.json(
      { data: client, message: 'Client found', success: true },
      OK
   )
}
