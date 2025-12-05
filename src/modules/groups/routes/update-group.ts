import { createRoute } from '@hono/zod-openapi'
import { OK, NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zId, zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectGroup, zUpdateGroup } from '../groups.schema'
import { findGroupById, updateGroup } from '../groups.service'

export const updateGroupRoute = createRoute({
   path: '/api/v1/groups/{id}',
   method: 'patch',
   tags: ['Groups'],
   middleware: [checkToken] as const,
   request: {
      params: zId,
      body: jsonContent(zUpdateGroup, 'Group update details'),
   },
   responses: {
      [OK]: ApiResponse(zSelectGroup, 'Group updated successfully'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid group data'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Group not found'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const updateGroupHandler: AppRouteHandler<typeof updateGroupRoute> = async (c) => {
   const { id } = c.req.valid('param')
   const body = c.req.valid('json')

   try {
      const existingGroup = await findGroupById(id)
      if (!existingGroup) {
         return c.json(
            { data: {}, message: 'Group not found', success: false },
            NOT_FOUND
         )
      }

      const [updatedGroup] = await updateGroup(id, body)

      return c.json(
         {
            data: updatedGroup,
            message: 'Group updated successfully',
            success: true,
         },
         OK
      )
   } catch (error) {
      console.error('Error updating group:', error instanceof Error ? error.message : 'Unknown error')
      return c.json(
         { data: {}, message: 'Internal Server Error', success: false },
         INTERNAL_SERVER_ERROR
      )
   }
}
