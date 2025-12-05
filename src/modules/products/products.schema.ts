import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { productsTable } from '../../core/db/schema'

export type InsertProduct = typeof productsTable.$inferInsert
export type SelectProduct = typeof productsTable.$inferSelect

export const zInsertProduct = createInsertSchema(productsTable, {
   name: (schema) => schema.min(1, 'Name is required'),
   price: (schema) => schema,
}).omit({
   id: true,
   createdAt: true,
   updatedAt: true,
   creatorId: true,
})

export const zSelectProduct = createSelectSchema(productsTable)

export const zUpdateProduct = zInsertProduct.partial()
