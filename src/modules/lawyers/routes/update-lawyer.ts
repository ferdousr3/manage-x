import { createRoute, z } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zUpdateLawyer, zSelectLawyer } from '../lawyers.schema'
import { findLawyerById, updateLawyer } from '../lawyers.service'

export const updateLawyerRoute = createRoute({
   path: '/v1/lawyers/{id}',
   method: 'put',
   tags: ['Lawyers'],
   middleware: [checkToken] as const,
   request: {
      params: z.object({
         id: z.string(),
      }),
      body: jsonContent(zUpdateLawyer, 'Lawyer update data'),
   },
   responses: {
      [OK]: ApiResponse(zSelectLawyer, 'Lawyer updated successfully'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Lawyer not found'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const updateLawyerHandler: AppRouteHandler<typeof updateLawyerRoute> = async (c) => {
   try {
      const { id } = c.req.valid('param')
      const body = c.req.valid('json')

      const existing = await findLawyerById(id)
      if (!existing) {
         return c.json(
            {
               data: {},
               message: 'Lawyer not found',
               success: false,
            },
            NOT_FOUND
         )
      }

      const [updated] = await updateLawyer(id, body)

      return c.json(
         {
            data: updated,
            message: 'Lawyer updated successfully',
            success: true,
         },
         OK
      )
   } catch (error) {
      return c.json(
         {
            data: {},
            message: 'Internal server error',
            success: false,
         },
         INTERNAL_SERVER_ERROR
      )
   }
}
