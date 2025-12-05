import 'dotenv/config'
import { handle } from 'hono/vercel'

let app: any

try {
   // Dynamic import to catch any initialization errors
   const appModule = await import('../dist/app.js')
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

// Export for Vercel Serverless Functions
export default handle(app)
