import { createRoute } from '@hono/zod-openapi'
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, UNAUTHORIZED } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { uploadToImgBB, validateImageFile } from '../../../core/services/imgbb.service'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { ImageUploadResponseSchema } from '../upload.schema'

export const uploadImageRoute = createRoute({
   path: '/v1/upload/image',
   method: 'post',
   tags: ['Upload'],
   middleware: [checkToken] as const,
   description: 'Upload image to ImgBB (max 1.5MB after compression)',
   request: {
      body: {
         content: {
            'multipart/form-data': {
               schema: {
                  type: 'object',
                  properties: {
                     image: {
                        type: 'string',
                        format: 'binary',
                        description: 'Image file (JPEG, PNG, WebP)',
                     },
                  },
                  required: ['image'],
               },
            },
         },
      },
   },
   responses: {
      [CREATED]: ApiResponse(ImageUploadResponseSchema, 'Image uploaded successfully'),
      [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid file or file too large'),
      [UNAUTHORIZED]: ApiResponse(zEmpty, 'Unauthorized'),
      [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Upload failed'),
   },
})

export const uploadImageHandler: AppRouteHandler<typeof uploadImageRoute> = async (c) => {
   try {
      // Get the uploaded file from the request
      const body = await c.req.parseBody()
      const file = body.image as File

      if (!file) {
         return c.json(
            {
               data: {},
               message: 'No image file provided',
               success: false,
            },
            BAD_REQUEST
         )
      }

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Create a mock Express.Multer.File object for validation
      const multerFile = {
         buffer,
         mimetype: file.type,
         size: buffer.length,
         originalname: file.name,
      } as Express.Multer.File

      // Validate file
      const validation = validateImageFile(multerFile)
      if (!validation.valid) {
         return c.json(
            {
               data: {},
               message: validation.error || 'Invalid file',
               success: false,
            },
            BAD_REQUEST
         )
      }

      // Upload to ImgBB
      const result = await uploadToImgBB(buffer, file.name)

      return c.json(
         {
            data: {
               url: result.url,
               deleteUrl: result.deleteUrl,
               displayUrl: result.displayUrl,
               thumbUrl: result.thumbUrl,
            },
            message: 'Image uploaded successfully',
            success: true,
         },
         CREATED
      )
   } catch (error) {
      console.error('Upload error:', error)
      return c.json(
         {
            data: {},
            message: error instanceof Error ? error.message : 'Failed to upload image',
            success: false,
         },
         INTERNAL_SERVER_ERROR
      )
   }
}
