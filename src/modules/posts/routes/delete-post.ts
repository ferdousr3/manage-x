import { createRoute } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zId, zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { findPostById, deletePost } from '../posts.service'

export const deletePostRoute = createRoute({
   path: '/v1/posts/{id}',
   method: 'delete',
   tags: ['Posts'],
   middleware: [checkToken] as const,
   request: {
      params: zId,
   },
   responses: {
      [OK]: ApiResponse(zEmpty, 'Post deleted successfully'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Post not found'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const deletePostHandler: AppRouteHandler<typeof deletePostRoute> = async (c) => {
   const { id } = c.req.valid('param')

   try {
      const post = await findPostById(id)
      if (!post) {
         return c.json(
            { data: {}, message: 'Post not found', success: false },
            NOT_FOUND
         )
      }

      await deletePost(id)

      return c.json(
         { data: {}, message: 'Post deleted successfully', success: true },
         OK
      )
   } catch (error) {
      console.error('Error deleting post:', error instanceof Error ? error.message : 'Unknown error')
      return c.json(
         { data: {}, message: 'Internal Server Error', success: false },
         INTERNAL_SERVER_ERROR
      )
   }
}
