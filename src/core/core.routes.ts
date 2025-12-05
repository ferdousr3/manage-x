import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import jsonContent from 'stoker/openapi/helpers/json-content'
import { createRouter } from './create-app'

const healthRoute = createRoute({
   method: 'get',
   path: '/health',
   tags: ['Health'],
   description: 'Health check endpoint',
   responses: {
      [HttpStatusCodes.OK]: jsonContent(
         z.object({
            success: z.boolean(),
            message: z.string(),
            timestamp: z.string(),
         }),
         'Health check response'
      ),
   },
})

export const coreRoutes = createRouter().openapi(healthRoute, (c) => {
   return c.json(
      {
         success: true,
         message: 'Manage-X API is running',
         timestamp: new Date().toISOString(),
      },
      HttpStatusCodes.OK
   )
})
