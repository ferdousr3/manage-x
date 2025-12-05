import { and, count, eq, ilike } from 'drizzle-orm'
import { db } from '../../core/db/db'
import { postsTable } from '../../core/db/schema'
import type { InsertPost } from './posts.schema'

export async function findManyPosts(
   params: { search?: string; authorId?: string; published?: boolean },
   limit: number,
   offset: number
) {
   const searchTerm = params.search || ''

   const conditions = []

   if (params.authorId) {
      conditions.push(eq(postsTable.authorId, params.authorId))
   }

   if (params.published !== undefined) {
      conditions.push(eq(postsTable.published, params.published))
   }

   if (searchTerm) {
      conditions.push(ilike(postsTable.title, `%${searchTerm}%`))
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   return await db
      .select()
      .from(postsTable)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
}

export async function countPosts(params: {
   search?: string
   authorId?: string
   published?: boolean
}) {
   const searchTerm = params.search || ''

   const conditions = []

   if (params.authorId) {
      conditions.push(eq(postsTable.authorId, params.authorId))
   }

   if (params.published !== undefined) {
      conditions.push(eq(postsTable.published, params.published))
   }

   if (searchTerm) {
      conditions.push(ilike(postsTable.title, `%${searchTerm}%`))
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   const res = await db
      .select({ count: count(postsTable.id) })
      .from(postsTable)
      .where(whereClause)

   return res[0]?.count || 0
}

export async function findPostById(id: string) {
   return db.query.postsTable.findFirst({
      where: eq(postsTable.id, id),
   })
}

export async function createPost(post: InsertPost) {
   return await db.insert(postsTable).values(post).returning()
}

export async function updatePost(id: string, post: Partial<InsertPost>) {
   return db
      .update(postsTable)
      .set(post)
      .where(eq(postsTable.id, id))
      .returning()
}

export async function deletePost(id: string) {
   return db.delete(postsTable).where(eq(postsTable.id, id)).returning()
}
