import { relations } from 'drizzle-orm'
import { boolean, integer, numeric, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from '../columns.helpers'
import { generateId } from '../id.util'
import { usersTable } from './users.table'

export const lawyerStatusEnum = pgEnum('lawyer_status', ['pending', 'approved', 'hidden'])

export const lawyersTable = pgTable('lawyers', {
   id: text().primaryKey().$defaultFn(generateId),
   name: text().notNull(),
   instituteName: text(),
   practiceStartYear: integer(),
   lawyerType: text(),
   phoneNumber: text(),
   email: text(),
   profileImageUrl: text(),
   coverImageUrl: text(),
   description: text(),
   rating: numeric({ precision: 3, scale: 2 }).default('0'),
   address: text(),
   city: text(),
   district: text(),
   postCode: text(),
   website: text(),
   businessHours: text(),
   sponsored: boolean().default(false),
   sponsoredUntil: timestamp(),
   interestedArea: text(),
   latitude: numeric({ precision: 10, scale: 7 }),
   longitude: numeric({ precision: 10, scale: 7 }),
   status: lawyerStatusEnum().default('pending'),
   verified: boolean().default(false),
   creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
   ...timestamps,
})

export const lawyersRelations = relations(lawyersTable, ({ one }) => ({
   creator: one(usersTable, {
      fields: [lawyersTable.creatorId],
      references: [usersTable.id],
   }),
}))
