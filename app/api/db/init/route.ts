import { pool } from '@/lib/db'

export async function POST() {
  try {
    console.log('[Database Init API] Starting database initialization...')

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
    console.log('[Database Init API] ✓ admin_accounts table created')

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
    console.log('[Database Init API] ✓ user_accounts table created')

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON admin_accounts(email)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_accounts_restaurantId ON user_accounts("restaurantId")`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email)`)
    console.log('[Database Init API] ✓ Indexes created')

    return Response.json({
      success: true,
      message: 'Database tables and indexes created successfully',
    })
  } catch (error: any) {
    console.error('[Database Init API] Error:', error)
    return Response.json({
      success: false,
      error: error.message || 'Failed to initialize database',
    }, { status: 500 })
  }
}
