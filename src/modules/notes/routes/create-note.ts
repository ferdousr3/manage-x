import { createRoute } from '@hono/zod-openapi'
import { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zInsertNote, zSelectNote } from '../notes.schema'
import { createNote } from '../notes.service'

export const createNoteRoute = createRoute({
   path: '/api/v1/notes',
   method: 'post',
   tags: ['Notes'],
   middleware: [checkToken] as const,
   request: {
      body: jsonContent(zInsertNote, 'Note details'),
   },
   responses: {
      [CREATED]: ApiResponse(zSelectNote, 'Note created successfully'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid note data'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const createNoteHandler: AppRouteHandler<typeof createNoteRoute> = async (c) => {
   const body = c.req.valid('json')
   const payload = c.get('jwtPayload')

   try {
      const [newNote] = await createNote({
         ...body,
         creatorId: payload.sub,
      })

      return c.json(
         {
            data: newNote,
            message: 'Note created successfully',
            success: true,
         },
         CREATED
      )
   } catch (error) {
      console.error('Error creating note:', error instanceof Error ? error.message : 'Unknown error')
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
