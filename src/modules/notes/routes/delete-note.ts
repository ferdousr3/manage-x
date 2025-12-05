import { createRoute, z } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectNote } from '../notes.schema'
import { findNoteById, deleteNote } from '../notes.service'

export const deleteNoteRoute = createRoute({
   path: '/api/v1/notes/{id}',
   method: 'delete',
   tags: ['Notes'],
   middleware: [checkToken] as const,
   request: {
      params: z.object({
         id: z.string(),
      }),
   },
   responses: {
      [OK]: ApiResponse(zSelectNote, 'Note deleted successfully'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Note not found'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const deleteNoteHandler: AppRouteHandler<typeof deleteNoteRoute> = async (c) => {
   try {
      const { id } = c.req.valid('param')

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

      const [deleted] = await deleteNote(id)

      return c.json(
         {
            data: deleted,
            message: 'Note deleted successfully',
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
