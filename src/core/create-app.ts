import { OpenAPIHono } from '@hono/zod-openapi'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'
import { poweredBy } from 'hono/powered-by'
import { requestId } from 'hono/request-id'
import { secureHeaders } from 'hono/secure-headers'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { serveEmojiFavicon } from 'stoker/middlewares'
import { defaultHook } from 'stoker/openapi'
import type { AppBindings } from './core.type'
import { customLogger } from './logger'
import { onErrorFn } from './on-error'
import { notFoundFn } from './on-not-found'

const isVercel = process.env.VERCEL === '1'

export function createRouter() {
   return new OpenAPIHono<AppBindings>({ strict: false, defaultHook })
}

export default function createApp() {
   const app = createRouter()

   // Request ID and logging
   app.use('*', requestId())
   app.use('*', customLogger())

   // Standard middlewares
   app.use(serveEmojiFavicon('🚀'))
   app.use(trimTrailingSlash())
   app.use(poweredBy())
   app.use(secureHeaders())
   app.use(cors())

   // Disable compression on Vercel (can cause streaming issues)
   if (!isVercel) {
      app.use(compress())
   }

   // Error handlers
   app.notFound(notFoundFn)
   app.onError(onErrorFn())

   return app
}
