import { apiReference } from '@scalar/hono-api-reference'
import type { AppOpenAPI } from './core.type'

export default function configureOpenAPI(app: AppOpenAPI) {
   app.doc('/doc', {
      openapi: '3.0.0',
      info: {
         title: 'Manage-X API',
         version: '1.0.0',
         description: 'REST API for managing posts, products, clients, and groups',
      },
   })

   app.get(
      '/docs',
      apiReference({
         pageTitle: 'Manage-X API Docs',
         spec: {
            url: '/doc',
         },
      })
   )
}
