import { relations } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../columns.helpers'
import { generateId } from '../id.util'
import { groupsTable } from './groups.table'
import { usersTable } from './users.table'

export const clientsTable = pgTable('clients', {
   id: text().primaryKey().$defaultFn(generateId),
   name: text().notNull(),
   email: text().notNull(),
   phone: text(),
   address: text(),
   company: text(),
   groupId: text()
      .references(() => groupsTable.id, { onDelete: 'cascade' }),
   creatorId: text()
      .references(() => usersTable.id, { onDelete: 'set null' }),
   ...timestamps,
})

export const clientsRelations = relations(clientsTable, ({ one }) => ({
   group: one(groupsTable, {
      fields: [clientsTable.groupId],
      references: [groupsTable.id],
   }),
   creator: one(usersTable, {
      fields: [clientsTable.creatorId],
      references: [usersTable.id],
   }),
}))
