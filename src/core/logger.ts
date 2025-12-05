import pino from 'pino'

const isProduction = process.env.NODE_ENV === 'production'
const isVercel = process.env.VERCEL === '1'
const isNetlify = process.env.NETLIFY === 'true' || process.env.CONTEXT !== undefined

// In serverless environments (Vercel/Netlify) or production, use simple JSON logging
// pino-pretty doesn't work in serverless functions due to transport limitations
export const logger = pino({
   level: process.env.LOG_LEVEL || 'info',
   // Only use pino-pretty in local development (not in serverless or production)
   transport:
      !isProduction && !isVercel && !isNetlify
         ? {
            target: 'pino-pretty',
            options: {
               colorize: true,
               translateTime: 'SYS:standard',
               ignore: 'pid,hostname',
            },
         }
         : undefined,
})

// Create child loggers for different modules
export const createModuleLogger = (moduleName: string) => {
   return logger.child({ module: moduleName })
}

// Pre-configured module loggers
export const dbLogger = createModuleLogger('database')
export const authLogger = createModuleLogger('auth')
export const apiLogger = createModuleLogger('api')
