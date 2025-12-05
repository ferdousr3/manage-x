import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import jsonContent from 'stoker/openapi/helpers/json-content'
import jsonContentRequired from 'stoker/openapi/helpers/json-content-required'
import createErrorSchema from 'stoker/openapi/schemas/create-error-schema'
import { createRouter } from '../../core/create-app'
import { checkToken } from '../../core/middlewares/check-token.middleware'
import {
   zLogin,
   zRegister,
   zChangePassword,
   zForgotPassword,
   zResetPassword,
   zRefreshToken,
   zVerifyEmail,
   AuthResponseSchema,
   MessageResponseSchema,
   UserResponseSchema,
} from './auth.schema'
import {
   loginUser,
   registerUser,
   refreshTokens,
   changePassword,
   requestPasswordReset,
   resetPassword,
   verifyEmailToken,
} from './auth.service'

// Login Route
const loginRoute = createRoute({
   method: 'post',
   path: '/api/v1/auth/login',
   tags: ['Authentication'],
   description: 'Login with email and password',
   request: {
      body: jsonContentRequired(zLogin, 'Login credentials'),
   },
   responses: {
      [HttpStatusCodes.OK]: jsonContent(AuthResponseSchema, 'Login successful'),
      [HttpStatusCodes.UNAUTHORIZED]: jsonContent(MessageResponseSchema, 'Invalid credentials'),
      [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
         createErrorSchema(zLogin),
         'Validation error'
      ),
   },
})

// Register Route
const registerRoute = createRoute({
   method: 'post',
   path: '/api/v1/auth/register',
   tags: ['Authentication'],
   description: 'Register a new account',
   request: {
      body: jsonContentRequired(zRegister, 'Registration data'),
   },
   responses: {
      [HttpStatusCodes.CREATED]: jsonContent(
         MessageResponseSchema.extend({ data: UserResponseSchema }),
         'Registration successful'
      ),
      [HttpStatusCodes.CONFLICT]: jsonContent(MessageResponseSchema, 'Email already exists'),
      [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
         createErrorSchema(zRegister),
         'Validation error'
      ),
   },
})

// Refresh Token Route
const refreshTokenRoute = createRoute({
   method: 'post',
   path: '/api/v1/auth/refresh-token',
   tags: ['Authentication'],
   description: 'Refresh access token',
   request: {
      body: jsonContentRequired(zRefreshToken, 'Refresh token'),
   },
   responses: {
      [HttpStatusCodes.OK]: jsonContent(
         MessageResponseSchema.extend({
            data: AuthResponseSchema.shape.data.pick({
               accessToken: true,
               refreshToken: true,
            }),
         }),
         'Tokens refreshed'
      ),
      [HttpStatusCodes.UNAUTHORIZED]: jsonContent(MessageResponseSchema, 'Invalid token'),
   },
})

// Change Password Route
const changePasswordRoute = createRoute({
   method: 'post',
   path: '/api/v1/auth/change-password',
   tags: ['Authentication'],
   description: 'Change password for authenticated user',
   security: [{ Bearer: [] }],
   middleware: [checkToken],
   request: {
      body: jsonContentRequired(zChangePassword, 'Password change data'),
   },
   responses: {
      [HttpStatusCodes.OK]: jsonContent(MessageResponseSchema, 'Password changed'),
      [HttpStatusCodes.UNAUTHORIZED]: jsonContent(MessageResponseSchema, 'Invalid current password'),
      [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
         createErrorSchema(zChangePassword),
         'Validation error'
      ),
   },
})

// Forgot Password Route
const forgotPasswordRoute = createRoute({
   method: 'post',
   path: '/api/v1/auth/forgot-password',
   tags: ['Authentication'],
   description: 'Request password reset email',
   request: {
      body: jsonContentRequired(zForgotPassword, 'Email for password reset'),
   },
   responses: {
      [HttpStatusCodes.OK]: jsonContent(MessageResponseSchema, 'Reset email sent'),
      [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
         createErrorSchema(zForgotPassword),
         'Validation error'
      ),
   },
})

// Reset Password Route
const resetPasswordRoute = createRoute({
   method: 'post',
   path: '/api/v1/auth/reset-password',
   tags: ['Authentication'],
   description: 'Reset password with token',
   request: {
      body: jsonContentRequired(zResetPassword, 'Reset password data'),
   },
   responses: {
      [HttpStatusCodes.OK]: jsonContent(MessageResponseSchema, 'Password reset successful'),
      [HttpStatusCodes.BAD_REQUEST]: jsonContent(MessageResponseSchema, 'Invalid or expired token'),
      [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
         createErrorSchema(zResetPassword),
         'Validation error'
      ),
   },
})

// Verify Email Route
const verifyEmailRoute = createRoute({
   method: 'get',
   path: '/api/v1/auth/verify-email',
   tags: ['Authentication'],
   description: 'Verify email with token',
   request: {
      query: zVerifyEmail,
   },
   responses: {
      [HttpStatusCodes.OK]: jsonContent(MessageResponseSchema, 'Email verified'),
      [HttpStatusCodes.BAD_REQUEST]: jsonContent(MessageResponseSchema, 'Invalid or expired token'),
   },
})

// Create routes
export const authV1Routes = createRouter()
   .openapi(loginRoute, async (c) => {
      const body = c.req.valid('json')
      const result = await loginUser(body.email, body.password)

      if ('error' in result) {
         return c.json(
            { success: false, message: result.error },
            HttpStatusCodes.UNAUTHORIZED
         )
      }

      return c.json(
         {
            success: true,
            data: result,
         },
         HttpStatusCodes.OK
      )
   })
   .openapi(registerRoute, async (c) => {
      const body = c.req.valid('json')
      const result = await registerUser(body)

      if ('error' in result) {
         return c.json(
            { success: false, message: result.error },
            HttpStatusCodes.CONFLICT
         )
      }

      return c.json(
         {
            success: true,
            message: 'Registration successful. Please verify your email.',
            data: result.user,
         },
         HttpStatusCodes.CREATED
      )
   })
   .openapi(refreshTokenRoute, async (c) => {
      const body = c.req.valid('json')
      const result = await refreshTokens(body.refreshToken)

      if ('error' in result) {
         return c.json(
            { success: false, message: result.error },
            HttpStatusCodes.UNAUTHORIZED
         )
      }

      return c.json(
         {
            success: true,
            data: result,
         },
         HttpStatusCodes.OK
      )
   })
   .openapi(changePasswordRoute, async (c) => {
      const body = c.req.valid('json')
      const payload = c.get('jwtPayload')
      const userId = payload.sub as string

      const result = await changePassword(userId, body.currentPassword, body.newPassword)

      if ('error' in result) {
         return c.json(
            { success: false, message: result.error },
            HttpStatusCodes.UNAUTHORIZED
         )
      }

      return c.json(
         { success: true, message: 'Password changed successfully' },
         HttpStatusCodes.OK
      )
   })
   .openapi(forgotPasswordRoute, async (c) => {
      const body = c.req.valid('json')
      await requestPasswordReset(body.email)

      return c.json(
         { success: true, message: 'If the email exists, a reset link has been sent' },
         HttpStatusCodes.OK
      )
   })
   .openapi(resetPasswordRoute, async (c) => {
      const body = c.req.valid('json')
      const result = await resetPassword(body.token, body.password)

      if ('error' in result) {
         return c.json(
            { success: false, message: result.error },
            HttpStatusCodes.BAD_REQUEST
         )
      }

      return c.json(
         { success: true, message: 'Password reset successful' },
         HttpStatusCodes.OK
      )
   })
   .openapi(verifyEmailRoute, async (c) => {
      const { token } = c.req.valid('query')
      const result = await verifyEmailToken(token)

      if ('error' in result) {
         return c.json(
            { success: false, message: result.error },
            HttpStatusCodes.BAD_REQUEST
         )
      }

      return c.json(
         { success: true, message: 'Email verified successfully' },
         HttpStatusCodes.OK
      )
   })
