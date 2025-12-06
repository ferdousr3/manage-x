import axios from 'axios'
import FormData from 'form-data'
import sharp from 'sharp'

const IMGBB_API_KEY = process.env.IMGBB_API_KEY
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload'
const MAX_FILE_SIZE = 1.5 * 1024 * 1024 // 1.5MB in bytes

export interface ImageUploadResult {
   success: boolean
   url: string
   deleteUrl?: string
   displayUrl?: string
   thumbUrl?: string
}

/**
 * Compress image if it exceeds max size
 */
async function compressImage(buffer: Buffer, maxSizeBytes: number): Promise<Buffer> {
   let quality = 90
   let compressed = buffer

   while (compressed.length > maxSizeBytes && quality > 10) {
      compressed = await sharp(buffer)
         .jpeg({ quality, progressive: true })
         .toBuffer()

      quality -= 10
   }

   return compressed
}

/**
 * Upload image to ImgBB
 */
export async function uploadToImgBB(
   imageBuffer: Buffer,
   filename: string
): Promise<ImageUploadResult> {
   if (!IMGBB_API_KEY) {
      throw new Error('IMGBB_API_KEY is not configured')
   }

   try {
      // Check file size and compress if needed
      let finalBuffer = imageBuffer
      if (imageBuffer.length > MAX_FILE_SIZE) {
         console.log(`Image size ${imageBuffer.length} exceeds ${MAX_FILE_SIZE}, compressing...`)
         finalBuffer = await compressImage(imageBuffer, MAX_FILE_SIZE)
         console.log(`Compressed to ${finalBuffer.length} bytes`)
      }

      // Create form data
      const formData = new FormData()
      formData.append('image', finalBuffer.toString('base64'))
      formData.append('name', filename)

      // Upload to ImgBB
      const response = await axios.post(IMGBB_API_URL, formData, {
         params: {
            key: IMGBB_API_KEY,
         },
         headers: formData.getHeaders(),
      })

      if (response.data.success) {
         return {
            success: true,
            url: response.data.data.url,
            deleteUrl: response.data.data.delete_url,
            displayUrl: response.data.data.display_url,
            thumbUrl: response.data.data.thumb?.url,
         }
      }

      throw new Error('ImgBB upload failed')
   } catch (error) {
      console.error('ImgBB upload error:', error)
      throw new Error(
         error instanceof Error ? error.message : 'Failed to upload image to ImgBB'
      )
   }
}

/**
 * Validate image file
 */
export function validateImageFile(file: Express.Multer.File): { valid: boolean; error?: string } {
   // Check file type
   const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
   if (!allowedTypes.includes(file.mimetype)) {
      return {
         valid: false,
         error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      }
   }

   // Check file size (before compression)
   const maxSize = 5 * 1024 * 1024 // 5MB max before compression
   if (file.size > maxSize) {
      return {
         valid: false,
         error: 'File size too large. Maximum 5MB allowed.',
      }
   }

   return { valid: true }
}
