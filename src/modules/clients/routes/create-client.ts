import { createRoute } from '@hono/zod-openapi'
import { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zInsertClient, zSelectClient } from '../clients.schema'
import { createClient } from '../clients.service'

export const createClientRoute = createRoute({
   path: '/v1/clients',
   method: 'post',
   tags: ['Clients'],
   middleware: [checkToken] as const,
   request: {
      body: jsonContent(zInsertClient, 'Client details'),
   },
   responses: {
      [CREATED]: ApiResponse(zSelectClient, 'Client created successfully'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid client data'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const createClientHandler: AppRouteHandler<typeof createClientRoute> = async (c) => {
   const body = c.req.valid('json')
   const payload = c.get('jwtPayload')

   try {
      const [newClient] = await createClient({
         ...body,
         creatorId: payload.sub,
      })

      return c.json(
         {
            data: newClient,
            message: 'Client created successfully',
            success: true,
         },
         CREATED
      )
   } catch (error) {
      console.error('Error creating client:', error instanceof Error ? error.message : 'Unknown error')
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
