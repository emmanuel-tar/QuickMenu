# Setting Up the Authentication System

This guide walks you through setting up QuickMenu's dual authentication system.

## Prerequisites

- Neon PostgreSQL database connected
- Environment variables configured (.env.local)
- Application deployed or running locally

## Step 1: Database Setup

The authentication system requires two new tables:

### Create Admin Accounts Table

```sql
CREATE TABLE IF NOT EXISTS admin_accounts (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  name TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_accounts_email ON admin_accounts(email);
```

### Create User Accounts Table

```sql
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

CREATE INDEX idx_user_accounts_restaurantId ON user_accounts("restaurantId");
CREATE INDEX idx_user_accounts_email ON user_accounts(email);
```

**How to execute:**
1. Go to your Neon dashboard
2. Open the SQL editor for your database
3. Run each SQL statement above
4. Verify tables are created

## Step 2: Create First Admin Account

### Option A: Direct Database Insert

1. Open Neon SQL editor
2. Run a script to create admin (see helper script below)

### Option B: Create via Application

Add this temporary endpoint to `app/api/setup/admin/route.ts`:

```typescript
import { createAdminAccount } from '@/app/actions/admin-auth'

export async function POST(req: Request) {
  const { email, password, name } = await req.json()

  if (process.env.NODE_ENV !== 'development') {
    return Response.json({ error: 'Not available in production' }, { status: 403 })
  }

  const result = await createAdminAccount(email, password, name)

  if (result.success) {
    return Response.json({ message: 'Admin account created' })
  } else {
    return Response.json({ error: result.error }, { status: 400 })
  }
}
```

Then call:
```bash
curl -X POST http://localhost:3000/api/setup/admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secure-password","name":"Admin"}'
```

### Helper Script (SQL)

To create an admin account directly in the database:

```sql
-- First, install pgcrypto extension if not already installed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admin account
-- Password hashing note: In production, use proper bcrypt via application
INSERT INTO admin_accounts (email, "passwordHash", name)
VALUES (
  'admin@example.com',
  'YOUR_HASHED_PASSWORD_HERE',
  'Admin User'
);
```

**Note**: For production, always hash passwords using the application's `hashPassword` function, not in SQL.

## Step 3: Configure Environment Variables

Ensure your `.env.local` has:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# Better Auth (optional, for legacy auth)
BETTER_AUTH_SECRET=your-secret-key-here

# Node Environment
NODE_ENV=development
```

## Step 4: Test Admin Login

1. Start your application: `pnpm dev`
2. Navigate to `http://localhost:3000/admin-login`
3. Enter your admin email and password
4. Should redirect to `/admin-dashboard`
5. Verify restaurants are displayed

## Step 5: Create Staff Accounts

1. Log in as admin at `/admin-login`
2. View `/admin-dashboard`
3. Click "Manage Staff" on a restaurant
4. Click "+ Add New Staff Member"
5. Fill in:
   - Name (required for display)
   - Email (must be unique per restaurant)
   - Password (minimum 8 characters recommended)
6. Click "Create Account"

## Step 6: Test Staff Login

1. Log out from admin
2. Navigate to `/user-login`
3. Select the restaurant from dropdown
4. Enter the staff email and password
5. Should redirect to `/user/dashboard`
6. Verify restaurant name is displayed

## Step 7: Set Up Production Authentication

For production deployment on Vercel:

### 1. Set Environment Variables

Go to your Vercel project settings:
- Settings → Environment Variables
- Add `DATABASE_URL` (from Neon)
- Add `BETTER_AUTH_SECRET` (if using legacy auth)

### 2. Disable Setup Endpoints

Remove or protect any setup endpoints in production:

```typescript
if (process.env.VERCEL_ENV !== 'development') {
  return Response.json({ error: 'Forbidden' }, { status: 403 })
}
```

### 3. Create Production Admin

Use a secure method:
1. Database migration script
2. CLI tool with proper authentication
3. Manual database insert with proper hashing

### 4. Enable HTTPS

Cookie settings automatically switch to `secure: true` in production:

```typescript
secure: process.env.NODE_ENV === 'production'
```

## Step 8: Managing Multiple Admins

To create additional admin accounts (post-deployment):

### Method 1: Database Direct (Requires Access)

Use proper password hashing with your database tool.

### Method 2: Admin User Management Interface (Future)

Future versions will include admin-to-admin creation UI.

## Step 9: Backup and Disaster Recovery

### Export Credentials

Keep secure backups of:
1. Admin email addresses
2. Password recovery codes
3. Database connection strings

### Backup Strategy

```bash
# Backup admin accounts table
pg_dump \
  --host=neon-hostname \
  --username=user \
  --password \
  --table=admin_accounts \
  database_name > admin_backup.sql
```

## Troubleshooting

### Admin Login Not Working

**Issue**: "Invalid email or password" on `/admin-login`

**Solutions**:
1. Verify admin account exists in `admin_accounts` table
2. Check password hash format (`salt:hash`)
3. Ensure `NODE_ENV` is set correctly
4. Check browser cookies are enabled

### Staff Cannot Find Restaurant

**Issue**: Dropdown shows no restaurants on `/user-login`

**Solutions**:
1. Verify restaurants exist in database
2. Check `isActive = true` for restaurants
3. Check database connection string
4. Review browser console for errors

### Session Expires Too Quickly

**Issue**: User logged out after short time

**Solutions**:
1. Check `maxAge` setting in cookie (should be 7 days)
2. Verify time synchronization on server
3. Check cookie settings are correct

### Password Hash Mismatch

**Issue**: Admin/Staff cannot login after database reset

**Solutions**:
1. Verify password hashing algorithm (PBKDF2)
2. Check salt extraction is correct
3. Reset password by creating new account
4. Review `lib/password.ts` implementation

## Security Checklist

Before deploying to production:

- [ ] Change default admin passwords
- [ ] Enable HTTPS/SSL
- [ ] Set `NODE_ENV=production`
- [ ] Configure strong `BETTER_AUTH_SECRET`
- [ ] Disable setup endpoints
- [ ] Enable database backups
- [ ] Set up monitoring/logging
- [ ] Review session timeout (7 days is default)
- [ ] Test password reset flow
- [ ] Document admin account recovery process
- [ ] Implement 2FA for admin accounts (future)
- [ ] Set up audit logging (future)

## Next Steps

After setup:

1. Create multiple admin accounts
2. Create staff accounts for each restaurant
3. Test end-to-end login flows
4. Configure backup strategy
5. Document admin procedures
6. Train team on authentication system
7. Monitor login patterns for security
8. Plan for future features (2FA, SSO, etc.)

## Support

For issues or questions:
1. Check AUTHENTICATION.md for technical details
2. Review server action implementations
3. Check browser console for errors
4. Review application logs
5. Test with fresh browser session (clear cookies)
