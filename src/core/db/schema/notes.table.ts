import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from '../columns.helpers'
import { generateId } from '../id.util'
import { usersTable } from './users.table'

export const notesTable = pgTable('notes', {
   id: text().primaryKey().$defaultFn(generateId),
   title: text().notNull(),
   content: text(),
   caseId: text(),
   date: timestamp().defaultNow(),
   creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
   ...timestamps,
})

export const notesRelations = relations(notesTable, ({ one }) => ({
   creator: one(usersTable, {
      fields: [notesTable.creatorId],
      references: [usersTable.id],
   }),
}))
