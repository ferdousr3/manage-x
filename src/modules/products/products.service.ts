import { and, count, eq, ilike, gte, lte } from 'drizzle-orm'
import { db } from '../../core/db/db'
import { productsTable } from '../../core/db/schema'
import type { InsertProduct } from './products.schema'

export async function findManyProducts(
   params: { search?: string; creatorId?: string; minPrice?: number; maxPrice?: number },
   limit: number,
   offset: number
) {
   const searchTerm = params.search || ''

   const conditions = []

   if (params.creatorId) {
      conditions.push(eq(productsTable.creatorId, params.creatorId))
   }

   if (params.minPrice !== undefined) {
      conditions.push(gte(productsTable.price, params.minPrice.toString()))
   }

   if (params.maxPrice !== undefined) {
      conditions.push(lte(productsTable.price, params.maxPrice.toString()))
   }

   if (searchTerm) {
      conditions.push(ilike(productsTable.name, `%${searchTerm}%`))
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   return await db
      .select()
      .from(productsTable)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
}

export async function countProducts(params: {
   search?: string
   creatorId?: string
   minPrice?: number
   maxPrice?: number
}) {
   const searchTerm = params.search || ''

   const conditions = []

   if (params.creatorId) {
      conditions.push(eq(productsTable.creatorId, params.creatorId))
   }

   if (params.minPrice !== undefined) {
      conditions.push(gte(productsTable.price, params.minPrice.toString()))
   }

   if (params.maxPrice !== undefined) {
      conditions.push(lte(productsTable.price, params.maxPrice.toString()))
   }

   if (searchTerm) {
      conditions.push(ilike(productsTable.name, `%${searchTerm}%`))
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   const res = await db
      .select({ count: count(productsTable.id) })
      .from(productsTable)
      .where(whereClause)

   return res[0]?.count || 0
}

export async function findProductById(id: string) {
   return db.query.productsTable.findFirst({
      where: eq(productsTable.id, id),
   })
}

export async function createProduct(product: InsertProduct) {
   return await db.insert(productsTable).values(product).returning()
}

export async function updateProduct(id: string, product: Partial<InsertProduct>) {
   return db
      .update(productsTable)
      .set(product)
      .where(eq(productsTable.id, id))
      .returning()
}

export async function deleteProduct(id: string) {
   return db.delete(productsTable).where(eq(productsTable.id, id)).returning()
}
