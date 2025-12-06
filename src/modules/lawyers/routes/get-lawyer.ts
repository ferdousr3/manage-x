import { createRoute, z } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectLawyer } from '../lawyers.schema'
import { findLawyerById } from '../lawyers.service'

export const getLawyerRoute = createRoute({
   path: '/v1/lawyers/{id}',
   method: 'get',
   tags: ['Lawyers'],
   // Public route - no auth required
   request: {
      params: z.object({
         id: z.string(),
      }),
   },
   responses: {
      [OK]: ApiResponse(zSelectLawyer, 'Lawyer details'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Lawyer not found'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const getLawyerHandler: AppRouteHandler<typeof getLawyerRoute> = async (c) => {
   try {
      const { id } = c.req.valid('param')
      const lawyer = await findLawyerById(id)

      if (!lawyer) {
         return c.json(
            {
               data: {},
               message: 'Lawyer not found',
               success: false,
            },
            NOT_FOUND
         )
      }

      return c.json(
         {
            data: lawyer,
            message: 'Lawyer details',
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
