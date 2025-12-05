import { relations } from 'drizzle-orm'
import { integer, numeric, pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../columns.helpers'
import { generateId } from '../id.util'
import { usersTable } from './users.table'

export const productsTable = pgTable('products', {
   id: text().primaryKey().$defaultFn(generateId),
   name: text().notNull(),
   description: text(),
   price: numeric({ precision: 10, scale: 2 }).notNull(),
   stock: integer().notNull().default(0),
   image: text(),
   creatorId: text()
      .references(() => usersTable.id, { onDelete: 'set null' }),
   ...timestamps,
})

export const productsRelations = relations(productsTable, ({ one }) => ({
   creator: one(usersTable, {
      fields: [productsTable.creatorId],
      references: [usersTable.id],
   }),
}))
