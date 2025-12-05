import configureOpenAPI from './core/configure-open-api'
import { coreRoutes } from './core/core.routes'
import createApp from './core/create-app'
import { authV1Routes } from './modules/auth/auth.routes'
import { clientsV1Routes } from './modules/clients/clients.routes'
import { groupsV1Routes } from './modules/groups/groups.routes'
import { lawyersV1Routes } from './modules/lawyers/lawyers.routes'
import { notesV1Routes } from './modules/notes/notes.routes'
import { postsV1Routes } from './modules/posts/posts.routes'
import { productsV1Routes } from './modules/products/products.routes'

const app = createApp()

const routes = [
   coreRoutes,
   authV1Routes,
   postsV1Routes,
   productsV1Routes,
   clientsV1Routes,
   groupsV1Routes,
   lawyersV1Routes,
   notesV1Routes,
]

configureOpenAPI(app)

for (const route of routes) {
   app.route('/', route)
}

export default app

