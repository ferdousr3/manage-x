import { z } from 'zod'

export const zLogin = z.object({
   email: z.string().email('Invalid email address'),
   password: z.string().min(1, 'Password is required'),
})

export const zRegister = z.object({
   email: z.string().email('Invalid email address'),
   password: z.string().min(8, 'Password must be at least 8 characters'),
   firstName: z.string().min(1, 'First name is required'),
   lastName: z.string().min(1, 'Last name is required'),
})

export const zChangePassword = z.object({
   currentPassword: z.string().min(1, 'Current password is required'),
   newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export const zForgotPassword = z.object({
   email: z.string().email('Invalid email address'),
})

export const zResetPassword = z.object({
   token: z.string().min(1, 'Token is required'),
   password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const zRefreshToken = z.object({
   refreshToken: z.string().min(1, 'Refresh token is required'),
})

export const zVerifyEmail = z.object({
   token: z.string().min(1, 'Token is required'),
})

// Response schemas
export const UserResponseSchema = z.object({
   id: z.string(),
   email: z.string(),
   firstName: z.string(),
   lastName: z.string(),
   profilePhoto: z.string().nullable(),
   verified: z.boolean(),
   status: z.enum(['active', 'inactive', 'banned']),
   createdAt: z.string(),
})

export const AuthResponseSchema = z.object({
   success: z.boolean(),
   data: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
      user: UserResponseSchema,
   }),
})

export const MessageResponseSchema = z.object({
   success: z.boolean(),
   message: z.string(),
})
