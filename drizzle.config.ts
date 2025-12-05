import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config()

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
   throw new Error('DATABASE_URL is not defined in the environment variables.')
}

export default defineConfig({
   dialect: 'postgresql',
   dbCredentials: {
      url: dbUrl,
   },
   schema: './src/core/db/schema',
   out: './src/core/db/migrations',
   verbose: process.env.NODE_ENV === 'production',
   strict: true,
   casing: 'snake_case',
   migrations: {
      schema: 'public',
   },
})
