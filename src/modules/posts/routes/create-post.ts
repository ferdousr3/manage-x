import { createRoute } from '@hono/zod-openapi'
import { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zInsertPost, zSelectPost } from '../posts.schema'
import { createPost } from '../posts.service'

export const createPostRoute = createRoute({
   path: '/v1/posts',
   method: 'post',
   tags: ['Posts'],
   middleware: [checkToken] as const,
   request: {
      body: jsonContent(zInsertPost, 'Post details'),
   },
   responses: {
      [CREATED]: ApiResponse(zSelectPost, 'Post created successfully'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid post data'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const createPostHandler: AppRouteHandler<typeof createPostRoute> = async (c) => {
   const body = c.req.valid('json')
   const payload = c.get('jwtPayload')

   try {
      const [newPost] = await createPost({
         ...body,
         authorId: payload.sub,
      })

      return c.json(
         {
            data: newPost,
            message: 'Post created successfully',
            success: true,
         },
         CREATED
      )
   } catch (error) {
      console.error('Error creating post:', error instanceof Error ? error.message : 'Unknown error')
      return c.json(
         {
            data: {},
            message: 'Internal Server Error',
            success: false,
         },
         INTERNAL_SERVER_ERROR
      )
   }
}
