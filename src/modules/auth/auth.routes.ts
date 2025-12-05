import { createRouter } from '../../core/create-app'
import { loginHandler, loginRoute } from './routes/login'
import { registerHandler, registerRoute } from './routes/register'
import { refreshTokenHandler, refreshTokenRoute } from './routes/refresh-token'
import { changePasswordHandler, changePasswordRoute } from './routes/change-password'
import { forgotPasswordHandler, forgotPasswordRoute } from './routes/forgot-password'
import { resetPasswordHandler, resetPasswordRoute } from './routes/reset-password'
import { verifyEmailHandler, verifyEmailRoute } from './routes/verify-email'

export const authV1Routes = createRouter()
   .openapi(loginRoute, loginHandler)
   .openapi(registerRoute, registerHandler)
   .openapi(refreshTokenRoute, refreshTokenHandler)
   .openapi(changePasswordRoute, changePasswordHandler)
   .openapi(forgotPasswordRoute, forgotPasswordHandler)
   .openapi(resetPasswordRoute, resetPasswordHandler)
   .openapi(verifyEmailRoute, verifyEmailHandler)
