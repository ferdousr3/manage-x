import { createRoute } from '@hono/zod-openapi'
import { OK, NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zId, zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectClient, zUpdateClient } from '../clients.schema'
import { findClientById, updateClient } from '../clients.service'

export const updateClientRoute = createRoute({
   path: '/api/v1/clients/{id}',
   method: 'patch',
   tags: ['Clients'],
   middleware: [checkToken] as const,
   request: {
      params: zId,
      body: jsonContent(zUpdateClient, 'Client update details'),
   },
   responses: {
      [OK]: ApiResponse(zSelectClient, 'Client updated successfully'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid client data'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Client not found'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const updateClientHandler: AppRouteHandler<typeof updateClientRoute> = async (c) => {
   const { id } = c.req.valid('param')
   const body = c.req.valid('json')
   const payload = c.get('jwtPayload')

   try {
      const existingClient = await findClientById(id)
      if (!existingClient) {
         return c.json(
            { data: {}, message: 'Client not found', success: false },
            NOT_FOUND
         )
      }

      const [updatedClient] = await updateClient(id, {
         ...body,
         creatorId: payload.sub,
      })

      return c.json(
         {
            data: updatedClient,
            message: 'Client updated successfully',
            success: true,
         },
         OK
      )
   } catch (error) {
      console.error('Error updating client:', error instanceof Error ? error.message : 'Unknown error')
      return c.json(
         { data: {}, message: 'Internal Server Error', success: false },
         INTERNAL_SERVER_ERROR
      )
   }
}
