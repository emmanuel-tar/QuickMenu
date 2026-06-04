# Database Troubleshooting Guide

## Problem: "relation 'restaurants' does not exist"

### Root Cause
When trying to create admin accounts or use the application, you get an error:
```
Database init error: relation "restaurants" does not exist
```

This happens because the database tables haven't been created yet. The TypeScript schema definitions don't automatically create PostgreSQL tables - they're just type definitions for Drizzle ORM.

### Solution: Automatic Database Initialization

When you try to create an admin account at `/admin-setup`, the system now automatically:
1. Calls `/api/db/init` endpoint
2. Creates ALL necessary tables in correct dependency order:
   - `restaurants`
   - `menu_categories`
   - `menu_items`
   - `menu_items_translations`
   - `admin_accounts`
   - `user_accounts`
3. Creates all performance indexes
4. Then creates the admin account

**No manual action needed** - just click "Quick Setup (Emmanuel Account)" and the system handles everything.

## Manual Database Initialization

If automatic initialization doesn't work, you can manually initialize the database:

### Option 1: Direct SQL (Recommended for Neon Console)

Go to your Neon PostgreSQL dashboard and run this SQL:

```sql
-- 1. Create restaurants table
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
);

-- 2. Create menu_categories table
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
);

-- 3. Create menu_items table
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
);

-- 4. Create menu_items_translations table
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
);

-- 5. Create admin_accounts table
CREATE TABLE IF NOT EXISTS admin_accounts (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  name TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create user_accounts table
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
);

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_userId ON restaurants("userId");
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurantId ON menu_categories("restaurantId");
CREATE INDEX IF NOT EXISTS idx_menu_items_categoryId ON menu_items("categoryId");
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurantId ON menu_items("restaurantId");
CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON admin_accounts(email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_restaurantId ON user_accounts("restaurantId");
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email);
```

### Option 2: Using Better Auth Tables

If you also want to set up the Better Auth tables for restaurant owner accounts, add this SQL:

```sql
-- Create "user" table (Better Auth)
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create "session" table (Better Auth)
CREATE TABLE IF NOT EXISTS "session" (
  id TEXT NOT NULL PRIMARY KEY,
  "expiresAt" TIMESTAMP NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create "account" table (Better Auth)
CREATE TABLE IF NOT EXISTS "account" (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refreshToken" TEXT,
  "accessToken" TEXT,
  "expiresAt" BIGINT,
  "tokenType" TEXT,
  scope TEXT,
  "idToken" TEXT,
  "sessionState" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create "verification" table (Better Auth)
CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT NOT NULL PRIMARY KEY,
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

## Verifying Database Setup

To verify all tables were created:

1. Go to your Neon dashboard
2. Open the SQL editor
3. Run:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

You should see:
- admin_accounts
- menu_categories
- menu_items
- menu_items_translations
- restaurants
- user_accounts
- (Optional) user, session, account, verification (Better Auth)

## Creating the Emmanuel Admin Account

After the database is initialized, the admin account will be created automatically at `/admin-setup` with:

- **Email:** admin@qmenu.com
- **Password:** admin123
- **Name:** Emmanuel

Or manually insert it:

```sql
INSERT INTO admin_accounts (email, "passwordHash", name) VALUES (
  'admin@qmenu.com',
  '2170c8e018042dc4265fc0952d6e4739:3dc1388eeda5373347e5efb7042b360311a005475440cf9a28eb93f903809e9ffdbbc33dd172fa14ebdc097f4994428358f97478a0d5af2612c70550eb4b86c3',
  'Emmanuel'
);
```

## Common Errors and Solutions

### Error: "relation 'admin_accounts' does not exist"
- Tables weren't created
- Solution: Go to `/admin-setup` and click "Quick Setup"

### Error: "foreign key violation"
- Trying to create user_accounts before restaurants table exists
- Solution: Run all tables in order or use automatic initialization

### Error: "unique violation on admin_accounts.email"
- Admin account already exists
- Solution: Use `/admin-login` to login with existing credentials

## Testing the Setup

1. Go to `/admin-setup`
2. Click "Quick Setup (Emmanuel Account)"
3. Wait for "Database initialized" message
4. Account will be created automatically
5. Redirected to `/admin-login`
6. Login with admin@qmenu.com / admin123

## Still Having Issues?

Check the browser console and server logs for specific error messages. The `/api/db/init` endpoint returns detailed error information to help debug database issues.
