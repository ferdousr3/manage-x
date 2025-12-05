import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import { z } from 'zod'

expand(config())

const EnvSchema = z.object({
   NODE_ENV: z.string().default('development'),
   PORT: z.coerce.number().default(3000),
   DATABASE_URL: z.string(),
   DB_MODE: z.enum(['pg', 'neon']).default('pg'),
   FRONTEND_URL: z.string().default('http://localhost:5173'),
   BACKEND_URL: z.string().default('http://localhost:3000'),
   ACCESS_TOKEN_SECRET: z.string().min(32),
   REFRESH_TOKEN_SECRET: z.string().min(32),
   EMAIL_RESEND_API_KEY: z.string().optional(),
   EMAIL_SENDER_NAME: z.string().default('Manage-X'),
   EMAIL_SENDER_EMAIL: z.string().email().optional(),
})

export type TEnv = z.infer<typeof EnvSchema>

let env: TEnv

try {
   env = EnvSchema.parse(process.env)
} catch (error) {
   if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      console.error(error.flatten().fieldErrors)
      process.exit(1)
   }
   throw error
}

export default env
