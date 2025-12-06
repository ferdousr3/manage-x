import { relations } from 'drizzle-orm'
import { integer, json, numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from '../columns.helpers'
import { generateId } from '../id.util'
import { usersTable } from './users.table'

export const carsTable = pgTable('cars', {
   id: text().primaryKey().$defaultFn(generateId),
   name: text().notNull(),
   brand: text().notNull(),
   model: text().notNull(),
   year: integer().notNull(),
   basePrice: numeric('base_price', { precision: 10, scale: 2 }).notNull(),
   description: text(),
   imageUrl: text(),
   modelUrl: text(), // 3D model URL (.glb/.gltf)
   creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
   ...timestamps,
})

export const carsRelations = relations(carsTable, ({ one, many }) => ({
   creator: one(usersTable, {
      fields: [carsTable.creatorId],
      references: [usersTable.id],
   }),
   parts: many(carPartsTable),
}))

export const carPartsTable = pgTable('car_parts', {
   id: text().primaryKey().$defaultFn(generateId),
   carId: text()
      .references(() => carsTable.id, { onDelete: 'cascade' })
      .notNull(),
   partType: text().notNull(), // 'engine', 'wheel', 'door', 'paint', 'interior'
   partName: text().notNull(),
   price: numeric('price', { precision: 10, scale: 2 }).notNull(),
   description: text(),
   imageUrl: text(),
   specifications: json().$type<Record<string, any>>(), // Additional specs (horsepower, size, etc.)
   ...timestamps,
})

export const carPartsRelations = relations(carPartsTable, ({ one }) => ({
   car: one(carsTable, {
      fields: [carPartsTable.carId],
      references: [carsTable.id],
   }),
}))
