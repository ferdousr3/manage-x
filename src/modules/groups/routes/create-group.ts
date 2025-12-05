import { createRoute } from '@hono/zod-openapi'
import { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zInsertGroup, zSelectGroup } from '../groups.schema'
import { createGroup } from '../groups.service'

export const createGroupRoute = createRoute({
   path: '/api/v1/groups',
   method: 'post',
   tags: ['Groups'],
   middleware: [checkToken] as const,
   request: {
      body: jsonContent(zInsertGroup, 'Group details'),
   },
   responses: {
      [CREATED]: ApiResponse(zSelectGroup, 'Group created successfully'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid group data'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const createGroupHandler: AppRouteHandler<typeof createGroupRoute> = async (c) => {
   const body = c.req.valid('json')
   const payload = c.get('jwtPayload')

   try {
      const [newGroup] = await createGroup({
         ...body,
         ownerId: payload.sub,
      })

      return c.json(
         {
            data: newGroup,
            message: 'Group created successfully',
            success: true,
         },
         CREATED
      )
   } catch (error) {
      console.error('Error creating group:', error instanceof Error ? error.message : 'Unknown error')
      return c.json(
         {
            data: {},
            message: 'Internal Server Error',
            success: false,
         },
         INTERNAL_SERVER_ERROR
      )
   }
}
