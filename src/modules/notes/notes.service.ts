import { and, count, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../core/db/db'
import { notesTable } from '../../core/db/schema'
import type { InsertNote } from './notes.schema'

export async function findManyNotes(
   params: {
      search?: string
      caseId?: string
      creatorId?: string
   },
   limit: number,
   offset: number
) {
   const conditions = []

   if (params.search) {
      conditions.push(
         or(
            ilike(notesTable.title, `%${params.search}%`),
            ilike(notesTable.content, `%${params.search}%`)
         )
      )
   }

   if (params.caseId) {
      conditions.push(eq(notesTable.caseId, params.caseId))
   }

   if (params.creatorId) {
      conditions.push(eq(notesTable.creatorId, params.creatorId))
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   return await db
      .select()
      .from(notesTable)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
}

export async function countNotes(params: {
   search?: string
   caseId?: string
   creatorId?: string
}) {
   const conditions = []

   if (params.search) {
      conditions.push(
         or(
            ilike(notesTable.title, `%${params.search}%`),
            ilike(notesTable.content, `%${params.search}%`)
         )
      )
   }

   if (params.caseId) {
      conditions.push(eq(notesTable.caseId, params.caseId))
   }

   if (params.creatorId) {
      conditions.push(eq(notesTable.creatorId, params.creatorId))
   }

   const whereClause = conditions.length > 0 ? and(...conditions) : undefined

   const res = await db
      .select({ count: count(notesTable.id) })
      .from(notesTable)
      .where(whereClause)

   return res[0]?.count || 0
}

export async function findNoteById(id: string) {
   return db.query.notesTable.findFirst({
      where: eq(notesTable.id, id),
   })
}

export async function createNote(note: InsertNote) {
   return await db.insert(notesTable).values(note).returning()
}

export async function updateNote(id: string, note: Partial<InsertNote>) {
   return db
      .update(notesTable)
      .set(note)
      .where(eq(notesTable.id, id))
      .returning()
}

export async function deleteNote(id: string) {
   return db.delete(notesTable).where(eq(notesTable.id, id)).returning()
}
