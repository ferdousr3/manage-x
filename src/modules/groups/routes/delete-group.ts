import { createRoute } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zId, zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { findGroupById, deleteGroup } from '../groups.service'

export const deleteGroupRoute = createRoute({
   path: '/v1/groups/{id}',
   method: 'delete',
   tags: ['Groups'],
   middleware: [checkToken] as const,
   request: {
      params: zId,
   },
   responses: {
      [OK]: ApiResponse(zEmpty, 'Group deleted successfully'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Group not found'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const deleteGroupHandler: AppRouteHandler<typeof deleteGroupRoute> = async (c) => {
   const { id } = c.req.valid('param')

   try {
      const group = await findGroupById(id)
      if (!group) {
         return c.json(
            { data: {}, message: 'Group not found', success: false },
            NOT_FOUND
         )
      }

      await deleteGroup(id)

      return c.json(
         { data: {}, message: 'Group deleted successfully', success: true },
         OK
      )
   } catch (error) {
      console.error('Error deleting group:', error instanceof Error ? error.message : 'Unknown error')
      return c.json(
         { data: {}, message: 'Internal Server Error', success: false },
         INTERNAL_SERVER_ERROR
      )
   }
}
