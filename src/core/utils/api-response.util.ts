import { z } from 'zod'
import jsonContent from 'stoker/openapi/helpers/json-content'

/**
 * Creates a standardized API response schema
 */
export function ApiResponse<T extends z.ZodTypeAny>(schema: T, description: string) {
   return jsonContent(
      z.object({
         success: z.boolean(),
         message: z.string(),
         data: schema,
      }),
      description
   )
}

/**
 * Creates a paginated API response schema
 */
export function ApiPaginatedResponse<T extends z.ZodTypeAny>(schema: T, description: string) {
   return jsonContent(
      z.object({
         success: z.boolean(),
         message: z.string(),
         data: z.array(schema),
         pagination: z.object({
            page: z.number(),
            size: z.number(),
            total: z.number(),
         }),
      }),
      description
   )
}
