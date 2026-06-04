import { pool } from '@/lib/db'

export async function POST() {
  try {
    console.log('[Database Init API] Starting database initialization...')

    // 1. Create restaurants table (needed for foreign keys)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        "cuisineType" TEXT,
        "imageUrl" TEXT,
        "qrCode" TEXT,
        "restaurantUrl" TEXT UNIQUE,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('[Database Init API] ✓ restaurants table created')

    // 2. Create menu_categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id SERIAL PRIMARY KEY,
        "restaurantId" INTEGER NOT NULL,
        "userId" TEXT NOT NULL,
        name TEXT NOT NULL,
        "displayOrder" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("restaurantId") REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `)
    console.log('[Database Init API] ✓ menu_categories table created')

    // 3. Create menu_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        "categoryId" INTEGER NOT NULL,
        "restaurantId" INTEGER NOT NULL,
        "userId" TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        "oldPrice" DECIMAL(10, 2),
        "imageUrl" TEXT,
        "isAvailable" BOOLEAN DEFAULT true,
        "displayOrder" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("categoryId") REFERENCES menu_categories(id) ON DELETE CASCADE,
        FOREIGN KEY ("restaurantId") REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `)
    console.log('[Database Init API] ✓ menu_items table created')

    // 4. Create menu_items_translations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items_translations (
        id SERIAL PRIMARY KEY,
        "menuItemId" INTEGER NOT NULL,
        language TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("menuItemId") REFERENCES menu_items(id) ON DELETE CASCADE,
        UNIQUE("menuItemId", language)
      )
    `)
    console.log('[Database Init API] ✓ menu_items_translations table created')

    // 5. Create admin_accounts table
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

    // 6. Create user_accounts table
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

    // 7. Create indexes for performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_restaurants_userId ON restaurants("userId")`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurantId ON menu_categories("restaurantId")`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_menu_items_categoryId ON menu_items("categoryId")`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_menu_items_restaurantId ON menu_items("restaurantId")`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON admin_accounts(email)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_accounts_restaurantId ON user_accounts("restaurantId")`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email)`)
    console.log('[Database Init API] ✓ All indexes created')

    return Response.json({
      success: true,
      message: 'All database tables and indexes created successfully',
    })
  } catch (error: any) {
    console.error('[Database Init API] Error:', error)
    return Response.json({
      success: false,
      error: error.message || 'Failed to initialize database',
    }, { status: 500 })
  }
}
