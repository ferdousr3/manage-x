import { createRoute } from '@hono/zod-openapi'
import { OK, UNAUTHORIZED } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zChangePassword } from '../auth.schema'
import { changePassword } from '../auth.service'

export const changePasswordRoute = createRoute({
   path: '/v1/auth/change-password',
   method: 'post',
   tags: ['Authentication'],
   description: 'Change password for authenticated user',
   security: [{ Bearer: [] }],
   middleware: [checkToken] as const,
   request: {
      body: jsonContent(zChangePassword, 'Password change data'),
   },
   responses: {
      [OK]: ApiResponse(zEmpty, 'Password changed successfully'),
      [UNAUTHORIZED]: ApiResponse(zEmpty, 'Invalid current password'),
   },
})

export const changePasswordHandler: AppRouteHandler<typeof changePasswordRoute> = async (c) => {
   const body = c.req.valid('json')
   const payload = c.get('jwtPayload')
   const userId = payload.sub as string

   const result = await changePassword(userId, body.currentPassword, body.newPassword)

   if ('error' in result) {
      return c.json(
         {
            data: {},
            message: result.error || 'Password change failed',
            success: false,
         },
         UNAUTHORIZED
      )
   }

   return c.json(
      {
         data: {},
         message: 'Password changed successfully',
         success: true,
      },
      OK
   )
}
