import 'dotenv/config'
import { serve } from '@hono/node-server'
import { showRoutes } from 'hono/dev'
import app from './app'
import env from './env'

const logRoutesToConsole = false

if (env.NODE_ENV !== 'production' && logRoutesToConsole) {
   showRoutes(app, { verbose: true })
}

serve({
   fetch: app.fetch,
   port: env.PORT,
})

console.log(`🚀 Manage-X API running at http://localhost:${env.PORT}`)
console.log(`📚 Swagger docs at http://localhost:${env.PORT}/docs`)
