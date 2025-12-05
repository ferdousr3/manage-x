import { pickBy } from 'es-toolkit'
import { pinoLogger } from 'hono-pino'
import { pino, stdTimeFunctions } from 'pino'
import env from '../env'

const isProduction = env.NODE_ENV === 'production'
const isNetlify = process.env.NETLIFY === 'true' || process.env.CONTEXT !== undefined

// Custom logger middleware with request/response logging
export const customLogger = () => {
   return pinoLogger({
      http: {
         reqId: () => crypto.randomUUID(),
         onReqBindings: (c) => ({
            req: {
               url: c.req.path,
               method: c.req.method,
               headers: pickBy(
                  c.req.header(),
                  (_value, key) =>
                     key.toLowerCase() === 'authorization' ||
                     key.toLowerCase().startsWith('x-'),
               ),
            },
         }),
         onReqMessage: async (c) => {
            const body = await c.req.raw.clone().text()
            return !isProduction ? `{ body: ${body} }` : '{}'
         },
      },
      pino: pino({
         level: process.env.LOG_LEVEL || 'info',
         redact: {
            paths: ['req.headers.authorization'],
         },
         // Only use pino-pretty in local development (not in Netlify or production)
         transport: isProduction || isNetlify
            ? undefined
            : {
               target: 'pino-pretty',
               options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
               },
            },
         timestamp: stdTimeFunctions.epochTime,
      }),
   })
}

// Export base logger for non-HTTP contexts
export const logger = pino({
   level: process.env.LOG_LEVEL || 'info',
   transport: isProduction || isNetlify
      ? undefined
      : {
         target: 'pino-pretty',
         options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
         },
      },
   timestamp: stdTimeFunctions.epochTime,
})

// Create child loggers for different modules
export const createModuleLogger = (moduleName: string) => {
   return logger.child({ module: moduleName })
}

// Pre-configured module loggers
export const dbLogger = createModuleLogger('database')
export const authLogger = createModuleLogger('auth')
export const apiLogger = createModuleLogger('api')
