import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { db } from './core/db/db'
import { usersTable } from './core/db/schema'
import { eq } from 'drizzle-orm'

async function updatePassword() {
   const email = ''
   const newPassword = ''
   const hashedPassword = await bcrypt.hash(newPassword, 12)

   console.log(`Updating password for ${email}...`)

   await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.email, email))

   process.exit(0)
}

updatePassword().catch(err => {
   console.error('Error:', err)
   process.exit(1)
})
