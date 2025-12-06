import { and, count, eq, ilike } from 'drizzle-orm'
import { db } from '../../core/db/db'
import { carPartsTable, carsTable } from '../../core/db/schema'
import type { InsertCar, InsertCarPart, UpdateCar, UpdateCarPart } from './cars.schema'

// ===== Car Services =====

export async function findManyCars(
   params: { search?: string; brand?: string; creatorId?: string },
   limit: number,
   offset: number
) {
   const searchTerm = params.search || ''
   const conditions = []

   if (params.creatorId) {
      conditions.push(eq(carsTable.creatorId, params.creatorId))
   }

   if (params.brand) {
      conditions.push(eq(carsTable.brand, params.brand))
   }

   if (searchTerm) {
      conditions.push(ilike(carsTable.name, `%${searchTerm}%`))
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   return await db.select().from(carsTable).where(whereClause).limit(limit).offset(offset)
}

export async function countCars(params: { search?: string; brand?: string; creatorId?: string }) {
   const searchTerm = params.search || ''
   const conditions = []

   if (params.creatorId) {
      conditions.push(eq(carsTable.creatorId, params.creatorId))
   }

   if (params.brand) {
      conditions.push(eq(carsTable.brand, params.brand))
   }

   if (searchTerm) {
      conditions.push(ilike(carsTable.name, `%${searchTerm}%`))
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   const res = await db.select({ count: count(carsTable.id) }).from(carsTable).where(whereClause)

   return res[0]?.count || 0
}

export async function findCarById(id: string) {
   return db.query.carsTable.findFirst({
      where: eq(carsTable.id, id),
      with: {
         parts: true,
      },
   })
}

export async function createCar(car: InsertCar & { creatorId: string }) {
   return await db.insert(carsTable).values(car).returning()
}

export async function updateCar(id: string, car: UpdateCar) {
   return db.update(carsTable).set(car).where(eq(carsTable.id, id)).returning()
}

export async function deleteCar(id: string) {
   return db.delete(carsTable).where(eq(carsTable.id, id)).returning()
}

// ===== Car Parts Services =====

export async function findCarParts(carId: string) {
   return await db.select().from(carPartsTable).where(eq(carPartsTable.carId, carId))
}

export async function findCarPartById(id: string) {
   return db.query.carPartsTable.findFirst({
      where: eq(carPartsTable.id, id),
   })
}

export async function createCarPart(part: InsertCarPart) {
   return await db.insert(carPartsTable).values(part).returning()
}

export async function updateCarPart(id: string, part: UpdateCarPart) {
   return db.update(carPartsTable).set(part).where(eq(carPartsTable.id, id)).returning()
}

export async function deleteCarPart(id: string) {
   return db.delete(carPartsTable).where(eq(carPartsTable.id, id)).returning()
}

// ===== Pricing Calculation =====

export async function calculateCarTotalPrice(carId: string, selectedPartIds: string[]) {
   const car = await findCarById(carId)
   if (!car) {
      throw new Error('Car not found')
   }

   let totalPrice = Number.parseFloat(car.basePrice)

   if (selectedPartIds.length > 0) {
      const parts = await db
         .select()
         .from(carPartsTable)
         .where(eq(carPartsTable.carId, carId))

      for (const partId of selectedPartIds) {
         const part = parts.find((p) => p.id === partId)
         if (part) {
            totalPrice += Number.parseFloat(part.price)
         }
      }
   }

   return totalPrice.toFixed(2)
}
