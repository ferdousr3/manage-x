import { sign, verify } from 'hono/jwt'
import env from '../../env'
import { DateUtil, addDuration, type DateUnit } from '../../core/utils/date.util'

export const ACCESS_TOKEN_LIFE = env.NODE_ENV !== 'production' ? 24 * 60 * 60 : 15 * 60 // 24h dev, 15m prod
export const REFRESH_TOKEN_LIFE = 7 * 24 * 60 * 60 // 7 days

export type AccessTokenPayload = {
   email: string
   firstName: string
   lastName: string
   status: 'active' | 'inactive' | 'banned'
   sub: string // userId
   exp: number
}

export type RefreshTokenPayload = {
   sub: string
   exp: number
}

export interface TokenUserData {
   id: string
   email: string
   firstName: string
   lastName: string
   status: 'active' | 'inactive' | 'banned'
}

export async function createAccessToken(user: TokenUserData): Promise<string> {
   const tokenPayload: AccessTokenPayload = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      sub: user.id,
      exp: DateUtil.addSeconds(DateUtil.date(), ACCESS_TOKEN_LIFE).getTime(),
   }

   return await sign(tokenPayload, env.ACCESS_TOKEN_SECRET)
}

export async function createRefreshToken(userId: string): Promise<string> {
   const tokenPayload: RefreshTokenPayload = {
      sub: userId,
      exp: DateUtil.addSeconds(DateUtil.date(), REFRESH_TOKEN_LIFE).getTime(),
   }
   return await sign(tokenPayload, env.REFRESH_TOKEN_SECRET)
}

export async function decodeRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
   try {
      const { sub, exp } = await verify(token, env.REFRESH_TOKEN_SECRET)
      if (exp && (exp as number) < DateUtil.date().getTime()) return null
      return {
         sub: sub as string,
         exp: exp as number,
      }
   } catch {
      return null
   }
}

export async function createVerificationToken(
   userId: string,
   duration: { value: number; unit: DateUnit },
   email: string
): Promise<string> {
   const token = await sign(
      {
         sub: userId,
         email,
         exp: addDuration(duration.value, duration.unit).getTime(),
      },
      env.REFRESH_TOKEN_SECRET
   )
   return token
}

export async function decodeVerificationToken(
   token: string
): Promise<{ email: string; userId: string } | null> {
   try {
      const { email, sub, exp } = await verify(token, env.REFRESH_TOKEN_SECRET)
      if (exp && (exp as number) < DateUtil.date().getTime()) return null
      return {
         email: email as string,
         userId: sub as string,
      }
   } catch {
      return null
   }
}

export async function createPasswordResetToken(
   userId: string,
   email: string
): Promise<string> {
   return await sign(
      {
         sub: userId,
         email,
         exp: addDuration(1, 'hours').getTime(), // 1 hour expiry
      },
      env.REFRESH_TOKEN_SECRET
   )
}

export async function decodePasswordResetToken(
   token: string
): Promise<{ email: string; userId: string } | null> {
   return await decodeVerificationToken(token)
}
