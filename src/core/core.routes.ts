import { createRouter } from './create-app'
import { homeHandler } from './routes/home'

const router = createRouter()

// Home page - displays server status with checkmark
router.get('/', homeHandler)

export const coreRoutes = router
