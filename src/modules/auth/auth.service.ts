import { eq } from 'drizzle-orm'
import * as argon2 from 'argon2'
import { db } from '../../core/db/db'
import { usersTable } from '../../core/db/schema'
import {
   createAccessToken,
   createRefreshToken,
   createVerificationToken,
   createPasswordResetToken,
   decodeRefreshToken,
   decodeVerificationToken,
   decodePasswordResetToken,
} from './token.util'

export async function findUserByEmail(email: string) {
   const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1)
   return users[0] || null
}

export async function findUserById(id: string) {
   const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1)
   return users[0] || null
}

export async function createUser(data: {
   email: string
   password: string
   firstName: string
   lastName: string
}) {
   const hashedPassword = await argon2.hash(data.password)

   const [user] = await db
      .insert(usersTable)
      .values({
         email: data.email.toLowerCase(),
         password: hashedPassword,
         firstName: data.firstName,
         lastName: data.lastName,
      })
      .returning()

   return user
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
   return await argon2.verify(hashedPassword, password)
}

export async function updatePassword(userId: string, newPassword: string) {
   const hashedPassword = await argon2.hash(newPassword)

   await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.id, userId))
}

export async function markEmailVerified(userId: string) {
   await db
      .update(usersTable)
      .set({ verified: true })
      .where(eq(usersTable.id, userId))
}

export async function updateLastLogin(userId: string) {
   await db
      .update(usersTable)
      .set({ lastLogin: new Date() })
      .where(eq(usersTable.id, userId))
}

export async function loginUser(email: string, password: string) {
   const user = await findUserByEmail(email)
   if (!user) {
      return { error: 'Invalid credentials' }
   }

   if (user.status === 'banned') {
      return { error: 'Account is banned' }
   }

   const isValidPassword = await verifyPassword(password, user.password)
   if (!isValidPassword) {
      return { error: 'Invalid credentials' }
   }

   await updateLastLogin(user.id)

   const accessToken = await createAccessToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
   })
   const refreshToken = await createRefreshToken(user.id)

   return {
      accessToken,
      refreshToken,
      user: {
         id: user.id,
         email: user.email,
         firstName: user.firstName,
         lastName: user.lastName,
         profilePhoto: user.profilePhoto,
         verified: user.verified,
         status: user.status,
         createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      },
   }
}

export async function registerUser(data: {
   email: string
   password: string
   firstName: string
   lastName: string
}) {
   const existingUser = await findUserByEmail(data.email)
   if (existingUser) {
      return { error: 'Email already registered' }
   }

   const user = await createUser(data)

   // Generate verification token
   const verificationToken = await createVerificationToken(
      user.id,
      { value: 24, unit: 'hours' },
      user.email
   )

   return {
      user: {
         id: user.id,
         email: user.email,
         firstName: user.firstName,
         lastName: user.lastName,
         profilePhoto: user.profilePhoto,
         verified: user.verified,
         status: user.status,
         createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      },
      verificationToken,
   }
}

export async function refreshTokens(refreshToken: string) {
   const payload = await decodeRefreshToken(refreshToken)
   if (!payload) {
      return { error: 'Invalid refresh token' }
   }

   const user = await findUserById(payload.sub)
   if (!user) {
      return { error: 'User not found' }
   }

   if (user.status === 'banned') {
      return { error: 'Account is banned' }
   }

   const newAccessToken = await createAccessToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
   })
   const newRefreshToken = await createRefreshToken(user.id)

   return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
   }
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
   const user = await findUserById(userId)
   if (!user) {
      return { error: 'User not found' }
   }

   const isValidPassword = await verifyPassword(currentPassword, user.password)
   if (!isValidPassword) {
      return { error: 'Current password is incorrect' }
   }

   await updatePassword(userId, newPassword)
   return { success: true }
}

export async function requestPasswordReset(email: string) {
   const user = await findUserByEmail(email)
   if (!user) {
      // Don't reveal if email exists
      return { success: true }
   }

   const resetToken = await createPasswordResetToken(user.id, user.email)

   // TODO: Send email with reset token
   console.log(`Password reset token for ${email}: ${resetToken}`)

   return { success: true, resetToken }
}

export async function resetPassword(token: string, newPassword: string) {
   const payload = await decodePasswordResetToken(token)
   if (!payload) {
      return { error: 'Invalid or expired token' }
   }

   const user = await findUserById(payload.userId)
   if (!user) {
      return { error: 'User not found' }
   }

   await updatePassword(user.id, newPassword)
   return { success: true }
}

export async function verifyEmailToken(token: string) {
   const payload = await decodeVerificationToken(token)
   if (!payload) {
      return { error: 'Invalid or expired token' }
   }

   const user = await findUserById(payload.userId)
   if (!user) {
      return { error: 'User not found' }
   }

   if (user.verified) {
      return { error: 'Email already verified' }
   }

   await markEmailVerified(user.id)
   return { success: true }
}
