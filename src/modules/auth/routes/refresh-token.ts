import { createRoute } from '@hono/zod-openapi'
import { OK, UNAUTHORIZED } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zRefreshToken } from '../auth.schema'
import { refreshTokens } from '../auth.service'
import { z } from 'zod'

const TokensSchema = z.object({
   accessToken: z.string(),
   refreshToken: z.string(),
})

export const refreshTokenRoute = createRoute({
   path: '/v1/auth/refresh-token',
   method: 'post',
   tags: ['Authentication'],
   description: 'Refresh access token',
   request: {
      body: jsonContent(zRefreshToken, 'Refresh token'),
   },
   responses: {
      [OK]: ApiResponse(TokensSchema, 'Tokens refreshed'),
      [UNAUTHORIZED]: ApiResponse(zEmpty, 'Invalid token'),
   },
})

export const refreshTokenHandler: AppRouteHandler<typeof refreshTokenRoute> = async (c) => {
   const body = c.req.valid('json')
   const result = await refreshTokens(body.refreshToken)

   if ('error' in result) {
      return c.json(
         {
            data: {},
            message: result.error || 'Token refresh failed',
            success: false,
         },
         UNAUTHORIZED
      )
   }

   return c.json(
      {
         data: result,
         message: 'Tokens refreshed successfully',
         success: true,
      },
      OK
   )
}
