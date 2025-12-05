import { relations } from 'drizzle-orm'
import {
   boolean,
   pgTable,
   text,
   timestamp,
   uniqueIndex,
} from 'drizzle-orm/pg-core'
import { timestamps } from '../columns.helpers'
import { generateId } from '../id.util'
import { userStatusEnum } from './_common.table'
import { clientsTable } from './clients.table'
import { groupsTable } from './groups.table'
import { postsTable } from './posts.table'
import { productsTable } from './products.table'

export const usersTable = pgTable(
   'users',
   {
      id: text().primaryKey().$defaultFn(generateId),
      email: text().notNull(),
      password: text().notNull(),
      firstName: text().notNull(),
      lastName: text().notNull(),
      profilePhoto: text(),
      verified: boolean().notNull().default(false),
      status: userStatusEnum().notNull().default('active'),
      lastLogin: timestamp({ withTimezone: true }),
      ...timestamps,
   },
   (table) => [uniqueIndex('email_unique_idx').on(table.email)]
)

export const usersRelations = relations(usersTable, ({ many }) => ({
   posts: many(postsTable),
   products: many(productsTable),
   clients: many(clientsTable),
   ownedGroups: many(groupsTable),
}))
