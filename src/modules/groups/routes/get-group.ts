import { createRoute } from '@hono/zod-openapi'
import { OK, NOT_FOUND } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zId, zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectGroup } from '../groups.schema'
import { findGroupById } from '../groups.service'

export const getGroupRoute = createRoute({
   path: '/api/v1/groups/{id}',
   method: 'get',
   tags: ['Groups'],
   middleware: [checkToken] as const,
   request: {
      params: zId,
   },
   responses: {
      [OK]: ApiResponse(zSelectGroup, 'Group found'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Group not found'),
   },
})

export const getGroupHandler: AppRouteHandler<typeof getGroupRoute> = async (c) => {
   const { id } = c.req.valid('param')
   const group = await findGroupById(id)

   if (!group) {
      return c.json(
         { message: 'Group not found', data: {}, success: false },
         NOT_FOUND
      )
   }

   return c.json(
      { data: group, message: 'Group found', success: true },
      OK
   )
}
