import { createRoute } from '@hono/zod-openapi'
import { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zInsertLawyer, zSelectLawyer } from '../lawyers.schema'
import { createLawyer } from '../lawyers.service'

export const createLawyerRoute = createRoute({
   path: '/v1/lawyers',
   method: 'post',
   tags: ['Lawyers'],
   middleware: [checkToken] as const,
   request: {
      body: jsonContent(zInsertLawyer, 'Lawyer details'),
   },
   responses: {
      [CREATED]: ApiResponse(zSelectLawyer, 'Lawyer created successfully'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid lawyer data'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const createLawyerHandler: AppRouteHandler<typeof createLawyerRoute> = async (c) => {
   const body = c.req.valid('json')
   const payload = c.get('jwtPayload')

   try {
      const [newLawyer] = await createLawyer({
         ...body,
         creatorId: payload.sub,
      })

      return c.json(
         {
            data: newLawyer,
            message: 'Lawyer created successfully',
            success: true,
         },
         CREATED
      )
   } catch (error) {
      console.error('Error creating lawyer:', error instanceof Error ? error.message : 'Unknown error')
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
