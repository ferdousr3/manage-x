import { createRoute, z } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zUpdateNote, zSelectNote } from '../notes.schema'
import { findNoteById, updateNote } from '../notes.service'

export const updateNoteRoute = createRoute({
   path: '/v1/notes/{id}',
   method: 'put',
   tags: ['Notes'],
   middleware: [checkToken] as const,
   request: {
      params: z.object({
         id: z.string(),
      }),
      body: jsonContent(zUpdateNote, 'Note update data'),
   },
   responses: {
      [OK]: ApiResponse(zSelectNote, 'Note updated successfully'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Note not found'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const updateNoteHandler: AppRouteHandler<typeof updateNoteRoute> = async (c) => {
   try {
      const { id } = c.req.valid('param')
      const body = c.req.valid('json')

      const existing = await findNoteById(id)
      if (!existing) {
         return c.json(
            {
               data: {},
               message: 'Note not found',
               success: false,
            },
            NOT_FOUND
         )
      }

      const [updated] = await updateNote(id, body)

      return c.json(
         {
            data: updated,
            message: 'Note updated successfully',
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
