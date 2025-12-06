import { createRoute } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zId, zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { findClientById, deleteClient } from '../clients.service'

export const deleteClientRoute = createRoute({
   path: '/v1/clients/{id}',
   method: 'delete',
   tags: ['Clients'],
   middleware: [checkToken] as const,
   request: {
      params: zId,
   },
   responses: {
      [OK]: ApiResponse(zEmpty, 'Client deleted successfully'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Client not found'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const deleteClientHandler: AppRouteHandler<typeof deleteClientRoute> = async (c) => {
   const { id } = c.req.valid('param')

   try {
      const client = await findClientById(id)
      if (!client) {
         return c.json(
            { data: {}, message: 'Client not found', success: false },
            NOT_FOUND
         )
      }

      await deleteClient(id)

      return c.json(
         { data: {}, message: 'Client deleted successfully', success: true },
         OK
      )
   } catch (error) {
      console.error('Error deleting client:', error instanceof Error ? error.message : 'Unknown error')
      return c.json(
         { data: {}, message: 'Internal Server Error', success: false },
         INTERNAL_SERVER_ERROR
      )
   }
}
