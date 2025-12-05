import pino from 'pino'

const isProduction = process.env.NODE_ENV === 'production'
const isVercel = process.env.VERCEL === '1'

// On Vercel/production, use simple JSON logging (no pino-pretty)
export const logger = pino({
   level: process.env.LOG_LEVEL || 'info',
   // Only use pino-pretty in local development
   transport:
      !isProduction && !isVercel
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
