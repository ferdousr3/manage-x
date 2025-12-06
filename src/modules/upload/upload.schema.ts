import { z } from 'zod'

export const ImageUploadResponseSchema = z.object({
   url: z.string().url(),
   deleteUrl: z.string().url().optional(),
   displayUrl: z.string().url().optional(),
   thumbUrl: z.string().url().optional(),
})

export type ImageUploadResponse = z.infer<typeof ImageUploadResponseSchema>
