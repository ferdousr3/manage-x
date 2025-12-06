import { createRoute } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zForgotPassword } from '../auth.schema'
import { requestPasswordReset } from '../auth.service'

export const forgotPasswordRoute = createRoute({
   path: '/v1/auth/forgot-password',
   method: 'post',
   tags: ['Authentication'],
   description: 'Request password reset email',
   request: {
      body: jsonContent(zForgotPassword, 'Email address'),
   },
   responses: {
      [OK]: ApiResponse(zEmpty, 'Reset email sent if account exists'),
   },
})

export const forgotPasswordHandler: AppRouteHandler<typeof forgotPasswordRoute> = async (c) => {
   const body = c.req.valid('json')
   await requestPasswordReset(body.email)

   return c.json(
      {
         data: {},
         message: 'If the email exists, a reset link has been sent',
         success: true,
      },
      OK
   )
}
