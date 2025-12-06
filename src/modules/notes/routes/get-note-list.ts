import { createRoute, z } from '@hono/zod-openapi'
import { OK, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmptyList } from '../../../core/models/common.schema'
import { ApiPaginatedResponse } from '../../../core/utils/api-response.util'
import { zSelectNote } from '../notes.schema'
import { findManyNotes, countNotes } from '../notes.service'

export const getNotesRoute = createRoute({
   path: '/v1/notes',
   method: 'get',
   tags: ['Notes'],
   middleware: [checkToken] as const,
   request: {
      query: z.object({
         search: z.string().optional(),
         page: z.coerce.number().optional().default(1),
         size: z.coerce.number().optional().default(10),
         caseId: z.string().optional(),
      }),
   },
   responses: {
      [OK]: ApiPaginatedResponse(zSelectNote, 'List of Notes'),
      [INTERNAL_SERVER_ERROR]: ApiPaginatedResponse(zEmptyList, 'Internal server error'),
   },
})

export const getNotesHandler: AppRouteHandler<typeof getNotesRoute> = async (c) => {
   try {
      const { search, page, size, caseId } = c.req.valid('query')

      const pageNumber = page || 1
      const limitNumber = size || 10

      const data = await findManyNotes(
         { search, caseId },
         limitNumber,
         (pageNumber - 1) * limitNumber
      )

      const total = await countNotes({ search, caseId })

      return c.json(
         {
            data,
            pagination: {
               page: pageNumber,
               size: limitNumber,
               total,
            },
            message: 'Note list',
            success: true,
         },
         OK
      )
   } catch (error) {
      return c.json(
         {
            data: [],
            pagination: { page: 1, size: 10, total: 0 },
            message: 'Internal server error',
            success: false,
         },
         INTERNAL_SERVER_ERROR
      )
   }
}
