import { createRouter } from '../../core/create-app'
import { createClientHandler, createClientRoute } from './routes/create-client'
import { deleteClientHandler, deleteClientRoute } from './routes/delete-client'
import { getClientHandler, getClientRoute } from './routes/get-client'
import { getClientsHandler, getClientsRoute } from './routes/get-client-list'
import { updateClientHandler, updateClientRoute } from './routes/update-client'

export const clientsV1Routes = createRouter()
   .openapi(createClientRoute, createClientHandler)
   .openapi(getClientsRoute, getClientsHandler)
   .openapi(getClientRoute, getClientHandler)
   .openapi(updateClientRoute, updateClientHandler)
   .openapi(deleteClientRoute, deleteClientHandler)
