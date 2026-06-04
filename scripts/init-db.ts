import { db, pool } from '@/lib/db'
import { adminAccounts, userAccounts } from '@/lib/db/schema'

async function initializeDatabase() {
  try {
    console.log('[Database Init] Starting database initialization...')

    // Create admin_accounts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_accounts (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        "passwordHash" TEXT NOT NULL,
        name TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('[Database Init] ✓ admin_accounts table created')

    // Create user_accounts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_accounts (
        id SERIAL PRIMARY KEY,
        "restaurantId" INTEGER NOT NULL,
        email TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        name TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("restaurantId") REFERENCES restaurants(id) ON DELETE CASCADE,
        UNIQUE("restaurantId", email)
      )
    `)
    console.log('[Database Init] ✓ user_accounts table created')

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON admin_accounts(email)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_accounts_restaurantId ON user_accounts("restaurantId")`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email)`)
    console.log('[Database Init] ✓ Indexes created')

    console.log('[Database Init] Database initialization completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('[Database Init] Error:', error)
    process.exit(1)
  }
}

initializeDatabase()
