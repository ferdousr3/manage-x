import { createRoute } from '@hono/zod-openapi'
import { OK, NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zId, zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectPost, zUpdatePost } from '../posts.schema'
import { findPostById, updatePost } from '../posts.service'

export const updatePostRoute = createRoute({
   path: '/api/v1/posts/{id}',
   method: 'patch',
   tags: ['Posts'],
   middleware: [checkToken] as const,
   request: {
      params: zId,
      body: jsonContent(zUpdatePost, 'Post update details'),
   },
   responses: {
      [OK]: ApiResponse(zSelectPost, 'Post updated successfully'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid post data'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Post not found'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const updatePostHandler: AppRouteHandler<typeof updatePostRoute> = async (c) => {
   const { id } = c.req.valid('param')
   const body = c.req.valid('json')

   try {
      const existingPost = await findPostById(id)
      if (!existingPost) {
         return c.json(
            { data: {}, message: 'Post not found', success: false },
            NOT_FOUND
         )
      }

      const [updatedPost] = await updatePost(id, body)

      return c.json(
         {
            data: updatedPost,
            message: 'Post updated successfully',
            success: true,
         },
         OK
      )
   } catch (error) {
      console.error('Error updating post:', error instanceof Error ? error.message : 'Unknown error')
      return c.json(
         { data: {}, message: 'Internal Server Error', success: false },
         INTERNAL_SERVER_ERROR
      )
   }
}
