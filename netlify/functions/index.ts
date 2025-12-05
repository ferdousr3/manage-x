import type { Context } from '@netlify/functions'
import 'dotenv/config'

let app: any

try {
   // Import the Hono app from source
   const appModule = await import('../../src/app')
   app = appModule.default
} catch (error) {
   console.error('Failed to initialize app:', error)
   // Return a minimal error response
   const { Hono } = await import('hono')
   app = new Hono()
   app.all('*', (c: any) => {
      return c.json({
         error: 'App initialization failed',
         message: error instanceof Error ? error.message : 'Unknown error'
      }, 500)
   })
}

// Netlify serverless function handler
export default async (request: Request, context: Context) => {
   return await app.fetch(request)
}
