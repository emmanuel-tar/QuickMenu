# Database Initialization Fix

## Problem
Admin and user account creation was failing with error:
```
relation "admin_accounts" does not exist
```

## Root Cause
The database tables (`admin_accounts` and `user_accounts`) were defined in the Drizzle schema file but were **never actually created** in the Neon PostgreSQL database. The schema definitions are just TypeScript types - they don't automatically create tables in the database.

## Solution
Added automatic database initialization that:
1. Creates the `admin_accounts` table if it doesn't exist
2. Creates the `user_accounts` table with proper foreign key to `restaurants`
3. Creates all necessary indexes for performance
4. Runs automatically when you first try to create an admin account

## How It Works

### Automatic Initialization (Recommended)
1. Go to `/admin-setup`
2. Click "Quick Setup (Emmanuel Account)" or create a custom account
3. The page automatically:
   - Calls `/api/db/init` to create tables
   - Creates the admin account
   - Redirects to login

### Manual Initialization (If Needed)
If you need to initialize the database manually:

**Via API:**
```bash
curl -X POST http://localhost:3000/api/db/init
```

**Via Node.js Script:**
```bash
npm run db:init
```

**Via psql (Direct SQL):**
```sql
CREATE TABLE IF NOT EXISTS admin_accounts (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  name TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON admin_accounts(email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_restaurantId ON user_accounts("restaurantId");
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email);
```

## Files Changed
- `app/api/db/init/route.ts` - API endpoint for database initialization
- `scripts/init-db.ts` - CLI script for initialization
- `app/admin-setup/page.tsx` - Updated to call init API before creating accounts

## Verification
After initialization, you can verify the tables were created:

```bash
psql $DATABASE_URL -c "\dt admin_accounts user_accounts"
psql $DATABASE_URL -c "\di *admin* *user*"
```

Should output:
```
              List of relations
Schema |           Name            | Type  | Owner
--------+---------------------------+-------+-------
public | admin_accounts            | table | 
public | idx_admin_accounts_email  | index |
public | user_accounts             | table |
public | idx_user_accounts_email   | index |
public | idx_user_accounts_restaurantId | index |
```

## Next Steps
1. Go to `/admin-setup`
2. Click "Quick Setup (Emmanuel Account)"
3. System will initialize database and create your admin account
4. Login at `/admin-login` with:
   - Email: `admin@qmenu.com`
   - Password: `admin123`

## Future Deployments
When you deploy to production (Vercel):
1. The first user to visit `/admin-setup` will trigger database initialization
2. Or you can manually call the `/api/db/init` endpoint
3. Subsequent calls are safe - they use `IF NOT EXISTS` clauses
