import { handle } from 'hono/vercel'
import app from '../src/app'

// Export for Vercel Serverless Functions
export default handle(app)
