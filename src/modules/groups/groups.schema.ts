import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { groupsTable } from '../../core/db/schema'

export type InsertGroup = typeof groupsTable.$inferInsert
export type SelectGroup = typeof groupsTable.$inferSelect

export const zInsertGroup = createInsertSchema(groupsTable, {
   name: (schema) => schema.min(1, 'Name is required'),
}).omit({
   id: true,
   createdAt: true,
   updatedAt: true,
   ownerId: true,
})

export const zSelectGroup = createSelectSchema(groupsTable)

export const zUpdateGroup = zInsertGroup.partial()
