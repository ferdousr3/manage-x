import { relations } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../columns.helpers'
import { generateId } from '../id.util'
import { clientsTable } from './clients.table'
import { usersTable } from './users.table'

export const groupsTable = pgTable('groups', {
   id: text().primaryKey().$defaultFn(generateId),
   name: text().notNull(),
   description: text(),
   ownerId: text()
      .references(() => usersTable.id, { onDelete: 'set null' }),
   ...timestamps,
})

export const groupsRelations = relations(groupsTable, ({ one, many }) => ({
   owner: one(usersTable, {
      fields: [groupsTable.ownerId],
      references: [usersTable.id],
   }),
   clients: many(clientsTable),
}))
