import { createRouter } from '../../core/create-app'
import { uploadImageHandler, uploadImageRoute } from './routes/upload-image'

const uploadRoutes = createRouter().openapi(uploadImageRoute, uploadImageHandler)

export { uploadRoutes as uploadV1Routes }
