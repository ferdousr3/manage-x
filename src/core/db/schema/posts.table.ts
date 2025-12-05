import { relations } from 'drizzle-orm'
import { boolean, pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../columns.helpers'
import { generateId } from '../id.util'
import { usersTable } from './users.table'

export const postsTable = pgTable('posts', {
   id: text().primaryKey().$defaultFn(generateId),
   title: text().notNull(),
   content: text().notNull(),
   published: boolean().notNull().default(false),
   authorId: text()
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
   ...timestamps,
})

export const postsRelations = relations(postsTable, ({ one }) => ({
   author: one(usersTable, {
      fields: [postsTable.authorId],
      references: [usersTable.id],
   }),
}))
