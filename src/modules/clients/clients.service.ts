import { and, count, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../core/db/db'
import { clientsTable } from '../../core/db/schema'
import type { InsertClient } from './clients.schema'

export async function findManyClients(
   params: { search?: string; groupId?: string; creatorId?: string },
   limit: number,
   offset: number
) {
   const searchTerm = params.search || ''

   const conditions = []

   if (params.groupId) {
      conditions.push(eq(clientsTable.groupId, params.groupId))
   }

   if (params.creatorId) {
      conditions.push(eq(clientsTable.creatorId, params.creatorId))
   }

   if (searchTerm) {
      conditions.push(
         or(
            ilike(clientsTable.name, `%${searchTerm}%`),
            ilike(clientsTable.phone, `%${searchTerm}%`),
            ilike(clientsTable.email, `%${searchTerm}%`)
         )
      )
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   return await db
      .select()
      .from(clientsTable)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
}

export async function countClients(params: {
   search?: string
   groupId?: string
   creatorId?: string
}) {
   const searchTerm = params.search || ''

   const conditions = []

   if (params.groupId) {
      conditions.push(eq(clientsTable.groupId, params.groupId))
   }

   if (params.creatorId) {
      conditions.push(eq(clientsTable.creatorId, params.creatorId))
   }

   if (searchTerm) {
      conditions.push(
         or(
            ilike(clientsTable.name, `%${searchTerm}%`),
            ilike(clientsTable.phone, `%${searchTerm}%`),
            ilike(clientsTable.email, `%${searchTerm}%`)
         )
      )
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   const res = await db
      .select({ count: count(clientsTable.id) })
      .from(clientsTable)
      .where(whereClause)

   return res[0]?.count || 0
}

export async function findClientById(id: string) {
   return db.query.clientsTable.findFirst({
      where: eq(clientsTable.id, id),
   })
}

export async function createClient(client: InsertClient) {
   return await db.insert(clientsTable).values(client).returning()
}

export async function updateClient(id: string, client: Partial<InsertClient>) {
   return db
      .update(clientsTable)
      .set(client)
      .where(eq(clientsTable.id, id))
      .returning()
}

export async function deleteClient(id: string) {
   return db.delete(clientsTable).where(eq(clientsTable.id, id)).returning()
}
