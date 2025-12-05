import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { postsTable } from '../../core/db/schema'

export type InsertPost = typeof postsTable.$inferInsert
export type SelectPost = typeof postsTable.$inferSelect

export const zInsertPost = createInsertSchema(postsTable, {
   title: (schema) => schema.min(1, 'Title is required'),
   content: (schema) => schema.min(1, 'Content is required'),
}).omit({
   id: true,
   createdAt: true,
   updatedAt: true,
   authorId: true,
})

export const zSelectPost = createSelectSchema(postsTable)

export const zUpdatePost = zInsertPost.partial()
