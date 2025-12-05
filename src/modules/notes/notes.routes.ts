import { createRouter } from '../../core/create-app'
import { createNoteHandler, createNoteRoute } from './routes/create-note'
import { deleteNoteHandler, deleteNoteRoute } from './routes/delete-note'
import { getNoteHandler, getNoteRoute } from './routes/get-note'
import { getNotesHandler, getNotesRoute } from './routes/get-note-list'
import { updateNoteHandler, updateNoteRoute } from './routes/update-note'

export const notesV1Routes = createRouter()
   .openapi(createNoteRoute, createNoteHandler)
   .openapi(getNotesRoute, getNotesHandler)
   .openapi(getNoteRoute, getNoteHandler)
   .openapi(updateNoteRoute, updateNoteHandler)
   .openapi(deleteNoteRoute, deleteNoteHandler)
