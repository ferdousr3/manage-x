import { z } from 'zod'

// Common ID param schema
export const zId = z.object({
   id: z.string(),
})

// Empty response schema
export const zEmpty = z.object({})

// Empty list response schema
export const zEmptyList = z.array(z.object({}))

// Pagination schema
export const zPagination = z.object({
   page: z.coerce.number().optional().default(1),
   size: z.coerce.number().optional().default(10),
   search: z.string().optional(),
})
