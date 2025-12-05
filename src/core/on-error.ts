import type { ErrorHandler } from 'hono'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import type { AppBindings } from './core.type'

export const onErrorFn = (): ErrorHandler<AppBindings> => {
   return (err, c) => {
      const statusCode = 'status' in err ? err.status : HttpStatusCodes.INTERNAL_SERVER_ERROR

      console.error(`[Error] ${err.message}`, err.stack)

      return c.json(
         {
            success: false,
            error: {
               message: err.message || 'Internal Server Error',
               ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
            },
         },
         statusCode as number
      )
   }
}
