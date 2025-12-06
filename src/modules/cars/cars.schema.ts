import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { carPartsTable, carsTable } from '../../core/db/schema'

// Car schemas
export const zInsertCar = createInsertSchema(carsTable, {
   name: z.string().min(1, 'Name is required'),
   brand: z.string().min(1, 'Brand is required'),
   model: z.string().min(1, 'Model is required'),
   year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
   basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
   description: z.string().optional(),
   imageUrl: z.string().url().optional(),
   modelUrl: z.string().url().optional(),
}).omit({
   id: true,
   createdAt: true,
   updatedAt: true,
   creatorId: true,
})

export const zSelectCar = createSelectSchema(carsTable)

export const zUpdateCar = zInsertCar.partial()

export type InsertCar = z.infer<typeof zInsertCar>
export type SelectCar = z.infer<typeof zSelectCar>
export type UpdateCar = z.infer<typeof zUpdateCar>

// Car Parts schemas
export const zInsertCarPart = createInsertSchema(carPartsTable, {
   carId: z.string().min(1, 'Car ID is required'),
   partType: z.enum(['engine', 'wheel', 'door', 'paint', 'interior']),
   partName: z.string().min(1, 'Part name is required'),
   price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
   description: z.string().optional(),
   imageUrl: z.string().url().optional(),
   specifications: z.record(z.string(), z.any()).optional(),
}).omit({
   id: true,
   createdAt: true,
   updatedAt: true,
})

export const zSelectCarPart = createSelectSchema(carPartsTable)

export const zUpdateCarPart = zInsertCarPart.partial().omit({ carId: true })

export type InsertCarPart = z.infer<typeof zInsertCarPart>
export type SelectCarPart = z.infer<typeof zSelectCarPart>
export type UpdateCarPart = z.infer<typeof zUpdateCarPart>

// Car with parts response
export const zCarWithParts = zSelectCar.extend({
   parts: z.array(zSelectCarPart),
   totalPrice: z.string().optional(),
})

export type CarWithParts = z.infer<typeof zCarWithParts>
