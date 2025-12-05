import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { clientsTable } from '../../core/db/schema'

export type InsertClient = typeof clientsTable.$inferInsert
export type SelectClient = typeof clientsTable.$inferSelect

export const zInsertClient = createInsertSchema(clientsTable, {
   name: (schema) => schema.min(1, 'Name is required'),
   email: (schema) => schema.email('Invalid email address'),
}).omit({
   id: true,
   createdAt: true,
   updatedAt: true,
   creatorId: true,
})

export const zSelectClient = createSelectSchema(clientsTable)

export const zUpdateClient = zInsertClient.partial()
