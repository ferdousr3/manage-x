import { createRoute, z } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectLawyer } from '../lawyers.schema'
import { findLawyerById, deleteLawyer } from '../lawyers.service'

export const deleteLawyerRoute = createRoute({
   path: '/api/v1/lawyers/{id}',
   method: 'delete',
   tags: ['Lawyers'],
   middleware: [checkToken] as const,
   request: {
      params: z.object({
         id: z.string(),
      }),
   },
   responses: {
      [OK]: ApiResponse(zSelectLawyer, 'Lawyer deleted successfully'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Lawyer not found'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const deleteLawyerHandler: AppRouteHandler<typeof deleteLawyerRoute> = async (c) => {
   try {
      const { id } = c.req.valid('param')

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

      const [deleted] = await deleteLawyer(id)

      return c.json(
         {
            data: deleted,
            message: 'Lawyer deleted successfully',
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
