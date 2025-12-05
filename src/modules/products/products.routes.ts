import { createRouter } from '../../core/create-app'
import { createProductHandler, createProductRoute } from './routes/create-product'
import { deleteProductHandler, deleteProductRoute } from './routes/delete-product'
import { getProductHandler, getProductRoute } from './routes/get-product'
import { getProductsHandler, getProductsRoute } from './routes/get-product-list'
import { updateProductHandler, updateProductRoute } from './routes/update-product'

export const productsV1Routes = createRouter()
   .openapi(createProductRoute, createProductHandler)
   .openapi(getProductsRoute, getProductsHandler)
   .openapi(getProductRoute, getProductHandler)
   .openapi(updateProductRoute, updateProductHandler)
   .openapi(deleteProductRoute, deleteProductHandler)
