import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleForNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzleForPg } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema/index'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
   throw new Error('DATABASE_URL is not defined')
}

// Default to 'neon' on Vercel/production, 'pg' locally
const isProduction = process.env.NODE_ENV === 'production'
const dbConnMode = process.env.DB_MODE || (isProduction ? 'neon' : 'pg')
const isNeonMode = dbConnMode === 'neon'

console.info(`📦 Database mode: ${dbConnMode}`)

// Use Neon serverless driver for Vercel, pg for local dev
export const db = isNeonMode
   ? drizzleForNeon(neon(dbUrl), {
      schema,
      casing: 'snake_case',
      logger: false,
   })
   : drizzleForPg(new Pool({ connectionString: dbUrl }), {
      schema,
      casing: 'snake_case',
      logger: false,
   })
