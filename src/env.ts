import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import { z } from 'zod'

// Only load from .env file in development (Vercel provides env vars directly)
if (process.env.NODE_ENV !== 'production') {
   expand(config())
}

const EnvSchema = z.object({
   NODE_ENV: z.string().default('development'),
   PORT: z.coerce.number().default(3000),
   DATABASE_URL: z.string(),
   DB_MODE: z.enum(['pg', 'neon']).default('neon'),
   FRONTEND_URL: z.string().default('http://localhost:5173'),
   BACKEND_URL: z.string().default('http://localhost:3000'),
   ACCESS_TOKEN_SECRET: z.string().min(32),
   REFRESH_TOKEN_SECRET: z.string().min(32),
   EMAIL_RESEND_API_KEY: z.string().optional(),
   EMAIL_SENDER_NAME: z.string().default('Manage-X'),
   EMAIL_SENDER_EMAIL: z.string().email().optional(),
   IMGBB_API_KEY: z.string().optional(),
})

export type TEnv = z.infer<typeof EnvSchema>

const parseEnv = (): TEnv => {
   const result = EnvSchema.safeParse(process.env)
   if (!result.success) {
      console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors)
      throw new Error('Invalid environment variables')
   }
   return result.data
}

const env = parseEnv()

export default env
