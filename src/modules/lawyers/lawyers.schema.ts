import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { lawyersTable } from '../../core/db/schema'

export type InsertLawyer = typeof lawyersTable.$inferInsert
export type SelectLawyer = typeof lawyersTable.$inferSelect

export const zInsertLawyer = createInsertSchema(lawyersTable, {
   name: (schema) => schema.min(1, 'Name is required'),
   email: (schema) => schema.email().optional(),
}).omit({
   id: true,
   createdAt: true,
   updatedAt: true,
})

export const zSelectLawyer = createSelectSchema(lawyersTable)

export const zUpdateLawyer = zInsertLawyer.partial()
