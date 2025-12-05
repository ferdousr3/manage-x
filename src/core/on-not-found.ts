import type { NotFoundHandler } from 'hono'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'

export const notFoundFn: NotFoundHandler = (c) => {
   return c.json(
      {
         success: false,
         message: `${HttpStatusPhrases.NOT_FOUND} - ${c.req.path}`,
      },
      HttpStatusCodes.NOT_FOUND
   )
}
