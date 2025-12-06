import { createRoute } from '@hono/zod-openapi'
import { OK, NOT_FOUND } from 'stoker/http-status-codes'
import type { AppRouteHandler } from '../../../core/core.type'
import { zId, zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zCarWithParts } from '../cars.schema'
import { findCarById } from '../cars.service'

export const getCarRoute = createRoute({
   path: '/v1/cars/{id}',
   method: 'get',
   tags: ['Cars'],
   request: {
      params: zId,
   },
   responses: {
      [OK]: ApiResponse(zCarWithParts, 'Car found with parts'),
      [NOT_FOUND]: ApiResponse(zEmpty, 'Car not found'),
   },
})

export const getCarHandler: AppRouteHandler<typeof getCarRoute> = async (c) => {
   const { id } = c.req.valid('param')
   const car = await findCarById(id)

   if (!car) {
      return c.json({ message: 'Car not found', data: {}, success: false }, NOT_FOUND)
   }

   // Calculate total price with all parts
   let totalPrice = Number.parseFloat(car.basePrice)
   if (car.parts && car.parts.length > 0) {
      for (const part of car.parts) {
         totalPrice += Number.parseFloat(part.price)
      }
   }

   return c.json(
      {
         data: {
            ...car,
            totalPrice: totalPrice.toFixed(2),
         },
         message: 'Car found',
         success: true,
      },
      OK
   )
}
