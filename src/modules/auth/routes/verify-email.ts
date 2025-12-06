import { createRoute } from '@hono/zod-openapi'
import { OK, BAD_REQUEST } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zVerifyEmail } from '../auth.schema'
import { verifyEmailToken } from '../auth.service'

export const verifyEmailRoute = createRoute({
   path: '/v1/auth/verify-email',
   method: 'get',
   tags: ['Authentication'],
   description: 'Verify email with token',
   request: {
      query: zVerifyEmail,
   },
   responses: {
      [OK]: ApiResponse(zEmpty, 'Email verified'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid or expired token'),
   },
})

export const verifyEmailHandler: AppRouteHandler<typeof verifyEmailRoute> = async (c) => {
   const { token } = c.req.valid('query')
   const result = await verifyEmailToken(token)

   if ('error' in result) {
      return c.json(
         {
            data: {},
            message: result.error || 'Email verification failed',
            success: false,
         },
         BAD_REQUEST
      )
   }

   return c.json(
      {
         data: {},
         message: 'Email verified successfully',
         success: true,
      },
      OK
   )
}
