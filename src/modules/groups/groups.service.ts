import { and, count, eq, ilike } from 'drizzle-orm'
import { db } from '../../core/db/db'
import { groupsTable } from '../../core/db/schema'
import type { InsertGroup } from './groups.schema'

export async function findManyGroups(
   params: { search?: string; ownerId?: string },
   limit: number,
   offset: number
) {
   const searchTerm = params.search || ''

   const conditions = []

   if (params.ownerId) {
      conditions.push(eq(groupsTable.ownerId, params.ownerId))
   }

   if (searchTerm) {
      conditions.push(ilike(groupsTable.name, `%${searchTerm}%`))
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   return await db
      .select()
      .from(groupsTable)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
}

export async function countGroups(params: {
   search?: string
   ownerId?: string
}) {
   const searchTerm = params.search || ''

   const conditions = []

   if (params.ownerId) {
      conditions.push(eq(groupsTable.ownerId, params.ownerId))
   }

   if (searchTerm) {
      conditions.push(ilike(groupsTable.name, `%${searchTerm}%`))
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   const res = await db
      .select({ count: count(groupsTable.id) })
      .from(groupsTable)
      .where(whereClause)

   return res[0]?.count || 0
}

export async function findGroupById(id: string) {
   return db.query.groupsTable.findFirst({
      where: eq(groupsTable.id, id),
   })
}

export async function createGroup(group: InsertGroup) {
   return await db.insert(groupsTable).values(group).returning()
}

export async function updateGroup(id: string, group: Partial<InsertGroup>) {
   return db
      .update(groupsTable)
      .set(group)
      .where(eq(groupsTable.id, id))
      .returning()
}

export async function deleteGroup(id: string) {
   return db.delete(groupsTable).where(eq(groupsTable.id, id)).returning()
}
