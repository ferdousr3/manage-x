import { createRouter } from '../../core/create-app'
import { createGroupHandler, createGroupRoute } from './routes/create-group'
import { deleteGroupHandler, deleteGroupRoute } from './routes/delete-group'
import { getGroupHandler, getGroupRoute } from './routes/get-group'
import { getGroupsHandler, getGroupsRoute } from './routes/get-group-list'
import { updateGroupHandler, updateGroupRoute } from './routes/update-group'

export const groupsV1Routes = createRouter()
   .openapi(createGroupRoute, createGroupHandler)
   .openapi(getGroupsRoute, getGroupsHandler)
   .openapi(getGroupRoute, getGroupHandler)
   .openapi(updateGroupRoute, updateGroupHandler)
   .openapi(deleteGroupRoute, deleteGroupHandler)
