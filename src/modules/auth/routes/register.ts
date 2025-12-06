import { createRoute } from '@hono/zod-openapi'
import { CREATED, CONFLICT, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zRegister, UserResponseSchema } from '../auth.schema'
import { registerUser } from '../auth.service'

export const registerRoute = createRoute({
   path: '/v1/auth/register',
   method: 'post',
   tags: ['Authentication'],
   description: 'Register a new account',
   request: {
      body: jsonContent(zRegister, 'Registration data'),
   },
   responses: {
      [CREATED]: ApiResponse(UserResponseSchema, 'Registration successful'),
      [CONFLICT]: ApiResponse(zEmpty, 'Email already exists'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
   },
})

export const registerHandler: AppRouteHandler<typeof registerRoute> = async (c) => {
   const body = c.req.valid('json')

   try {
      const result = await registerUser(body)

      if ('error' in result) {
         return c.json(
            {
               data: {},
               message: result.error || 'Registration failed',
               success: false,
            },
            CONFLICT
         )
      }

      return c.json(
         {
            data: result.user,
            message: 'Registration successful. Please verify your email.',
            success: true,
         },
         CREATED
      )
   } catch (error) {
      console.error('Error during registration:', error instanceof Error ? error.message : 'Unknown error')
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
