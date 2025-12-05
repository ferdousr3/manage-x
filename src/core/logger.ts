import pino from 'pino'

const isProduction = process.env.NODE_ENV === 'production'

export const logger = pino({
   level: process.env.LOG_LEVEL || 'info',
   transport: isProduction
      ? undefined
      : {
           target: 'pino-pretty',
           options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
           },
        },
})

// Create child loggers for different modules
export const createModuleLogger = (moduleName: string) => {
   return logger.child({ module: moduleName })
}

// Pre-configured module loggers
export const dbLogger = createModuleLogger('database')
export const authLogger = createModuleLogger('auth')
export const apiLogger = createModuleLogger('api')
