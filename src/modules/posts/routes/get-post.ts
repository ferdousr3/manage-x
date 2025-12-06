import { createRoute } from '@hono/zod-openapi'
import { OK, NOT_FOUND } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { zId, zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectPost } from '../posts.schema'
import { findPostById } from '../posts.service'

export const getPostRoute = createRoute({
   path: '/v1/posts/{id}',
   method: 'get',
   tags: ['Posts'],
   // Public route - no auth required
   request: {
      params: zId,
   },
   responses: {
      [OK]: ApiResponse(zSelectPost, 'Post found'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Post not found'),
   },
})

export const getPostHandler: AppRouteHandler<typeof getPostRoute> = async (c) => {
   const { id } = c.req.valid('param')
   const post = await findPostById(id)

   if (!post) {
      return c.json(
         { message: 'Post not found', data: {}, success: false },
         NOT_FOUND
      )
   }

   return c.json(
      { data: post, message: 'Post found', success: true },
      OK
   )
}
