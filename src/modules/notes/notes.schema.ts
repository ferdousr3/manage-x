import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { notesTable } from '../../core/db/schema'

export type InsertNote = typeof notesTable.$inferInsert
export type SelectNote = typeof notesTable.$inferSelect

export const zInsertNote = createInsertSchema(notesTable, {
   title: (schema) => schema.min(1, 'Title is required'),
}).omit({
   id: true,
   createdAt: true,
   updatedAt: true,
})

export const zSelectNote = createSelectSchema(notesTable)

export const zUpdateNote = zInsertNote.partial()
