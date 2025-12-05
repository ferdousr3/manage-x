import { createRoute } from '@hono/zod-openapi'
import { OK, UNAUTHORIZED } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zLogin, AuthResponseSchema } from '../auth.schema'
import { loginUser } from '../auth.service'

export const loginRoute = createRoute({
   path: '/api/v1/auth/login',
   method: 'post',
   tags: ['Authentication'],
   description: 'Login with email and password',
   request: {
      body: jsonContent(zLogin, 'Login credentials'),
   },
   responses: {
      [OK]: ApiResponse(AuthResponseSchema.shape.data, 'Login successful'),
      [UNAUTHORIZED]: ApiResponse(zEmpty, 'Invalid credentials'),
   },
})

export const loginHandler: AppRouteHandler<typeof loginRoute> = async (c) => {
   const body = c.req.valid('json')
   const result = await loginUser(body.email, body.password)

   if ('error' in result) {
      return c.json(
         {
            data: {},
            message: result.error || 'Invalid credentials',
            success: false,
         },
         UNAUTHORIZED
      )
   }

   return c.json(
      {
         data: result,
         message: 'Login successful',
         success: true,
      },
      OK
   )
}
