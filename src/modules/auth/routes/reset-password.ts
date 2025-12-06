import { createRoute } from '@hono/zod-openapi'
import { OK, BAD_REQUEST } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zResetPassword } from '../auth.schema'
import { resetPassword } from '../auth.service'

export const resetPasswordRoute = createRoute({
   path: '/v1/auth/reset-password',
   method: 'post',
   tags: ['Authentication'],
   description: 'Reset password using token',
   request: {
      body: jsonContent(zResetPassword, 'Reset password data'),
   },
   responses: {
      [OK]: ApiResponse(zEmpty, 'Password reset successful'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid or expired token'),
   },
})

export const resetPasswordHandler: AppRouteHandler<typeof resetPasswordRoute> = async (c) => {
   const body = c.req.valid('json')
   const result = await resetPassword(body.token, body.password)

   if ('error' in result) {
      return c.json(
         {
            data: {},
            message: result.error || 'Password reset failed',
            success: false,
         },
         BAD_REQUEST
      )
   }

   return c.json(
      {
         data: {},
         message: 'Password reset successful',
         success: true,
      },
      OK
   )
}
