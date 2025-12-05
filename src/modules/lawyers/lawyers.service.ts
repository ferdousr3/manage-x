import { and, count, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../core/db/db'
import { lawyersTable } from '../../core/db/schema'
import type { InsertLawyer } from './lawyers.schema'

export async function findManyLawyers(
   params: {
      search?: string
      type?: string
      district?: string
      status?: string
      creatorId?: string
   },
   limit: number,
   offset: number
) {
   const conditions = []

   if (params.search) {
      conditions.push(
         or(
            ilike(lawyersTable.name, `%${params.search}%`),
            ilike(lawyersTable.email, `%${params.search}%`),
            ilike(lawyersTable.instituteName, `%${params.search}%`)
         )
      )
   }

   if (params.type) {
      conditions.push(eq(lawyersTable.lawyerType, params.type))
   }

   if (params.district) {
      conditions.push(eq(lawyersTable.district, params.district))
   }

   if (params.status) {
      conditions.push(eq(lawyersTable.status, params.status as 'pending' | 'approved' | 'hidden'))
   }

   if (params.creatorId) {
      conditions.push(eq(lawyersTable.creatorId, params.creatorId))
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   return await db
      .select()
      .from(lawyersTable)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
}

export async function countLawyers(params: {
   search?: string
   type?: string
   district?: string
   status?: string
   creatorId?: string
}) {
   const conditions = []

   if (params.search) {
      conditions.push(
         or(
            ilike(lawyersTable.name, `%${params.search}%`),
            ilike(lawyersTable.email, `%${params.search}%`),
            ilike(lawyersTable.instituteName, `%${params.search}%`)
         )
      )
   }

   if (params.type) {
      conditions.push(eq(lawyersTable.lawyerType, params.type))
   }

   if (params.district) {
      conditions.push(eq(lawyersTable.district, params.district))
   }

   if (params.status) {
      conditions.push(eq(lawyersTable.status, params.status as 'pending' | 'approved' | 'hidden'))
   }

   if (params.creatorId) {
      conditions.push(eq(lawyersTable.creatorId, params.creatorId))
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   const res = await db
      .select({ count: count(lawyersTable.id) })
      .from(lawyersTable)
      .where(whereClause)

   return res[0]?.count || 0
}

export async function findLawyerById(id: string) {
   return db.query.lawyersTable.findFirst({
      where: eq(lawyersTable.id, id),
   })
}

export async function createLawyer(lawyer: InsertLawyer) {
   return await db.insert(lawyersTable).values(lawyer).returning()
}

export async function updateLawyer(id: string, lawyer: Partial<InsertLawyer>) {
   return db
      .update(lawyersTable)
      .set(lawyer)
      .where(eq(lawyersTable.id, id))
      .returning()
}

export async function deleteLawyer(id: string) {
   return db.delete(lawyersTable).where(eq(lawyersTable.id, id)).returning()
}
