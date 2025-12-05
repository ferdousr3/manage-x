import { createRouter } from '../../core/create-app'
import { createPostHandler, createPostRoute } from './routes/create-post'
import { deletePostHandler, deletePostRoute } from './routes/delete-post'
import { getPostHandler, getPostRoute } from './routes/get-post'
import { getPostsHandler, getPostsRoute } from './routes/get-post-list'
import { updatePostHandler, updatePostRoute } from './routes/update-post'

export const postsV1Routes = createRouter()
   .openapi(createPostRoute, createPostHandler)
   .openapi(getPostsRoute, getPostsHandler)
   .openapi(getPostRoute, getPostHandler)
   .openapi(updatePostRoute, updatePostHandler)
   .openapi(deletePostRoute, deletePostHandler)
