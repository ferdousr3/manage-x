import { createRouter } from '../../core/create-app'
import { createCarHandler, createCarRoute } from './routes/create-car'
import { getCarHandler, getCarRoute } from './routes/get-car'
import { getCarsHandler, getCarsRoute } from './routes/get-car-list'
import { createCarPartHandler, createCarPartRoute } from './routes/create-car-part'

export const carsV1Routes = createRouter()
   .openapi(getCarsRoute, getCarsHandler)
   .openapi(getCarRoute, getCarHandler)
   .openapi(createCarRoute, createCarHandler)
   .openapi(createCarPartRoute, createCarPartHandler)


