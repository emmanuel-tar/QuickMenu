# Authentication System Documentation

QuickMenu now features a dual authentication system with separate login flows for admins and staff members.

## Overview

The authentication system consists of:

1. **Admin Authentication** - For system administrators who manage restaurants and staff
2. **Staff Authentication** - For restaurant employees who manage menus
3. **Legacy Better Auth** - Original email/password system for restaurant owners

## Admin Authentication Flow

### Admin Login Page
**URL**: `/admin-login`

Admins sign in with their email and password. This directs them to the admin dashboard.

**Features**:
- Email-based login
- Secure password hashing with PBKDF2
- Session-based authentication with HTTP-only cookies
- 7-day session expiration

### Admin Dashboard
**URL**: `/admin-dashboard`

The admin dashboard allows admins to:
- View all restaurants in the system
- Manage staff accounts for each restaurant
- Create new staff accounts
- Deactivate staff accounts
- View staff email addresses

## Staff Authentication Flow

### Staff Login Page
**URL**: `/user-login`

Staff members select their restaurant from a dropdown, then enter their email and password.

**Features**:
- Restaurant dropdown selector (auto-loads from database)
- Email-based login scoped to the selected restaurant
- Password verification
- Session-based authentication

### Staff Dashboard
**URL**: `/user/dashboard`

Once logged in, staff members can:
- View their assigned restaurant
- Access the menu editor for that restaurant
- View the public menu
- See their account information

## Database Schema

### Admin Accounts Table
```sql
CREATE TABLE admin_accounts (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  name TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Accounts Table
```sql
CREATE TABLE user_accounts (
  id SERIAL PRIMARY KEY,
  restaurantId INTEGER NOT NULL,
  email TEXT NOT NULL,
  passwordHash TEXT NOT NULL,
  name TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
  UNIQUE(restaurantId, email)
);
```

## Creating Admin Accounts

### Initial Setup

To create the first admin account, you can use the `createAdminAccount` server action directly. In production, you would typically:

1. Have a secure setup endpoint (not exposed publicly)
2. Or create the first admin through database migration

```typescript
import { createAdminAccount } from '@/app/actions/admin-auth'

const result = await createAdminAccount('admin@example.com', 'secure-password', 'Admin Name')
```

## Managing Staff Accounts

### Creating Staff Accounts

Only admins can create staff accounts. The `ManageUsersDialog` component provides the UI for this.

1. Admin logs in at `/admin-login`
2. Views `/admin-dashboard`
3. Clicks "Manage Staff" on a restaurant
4. Clicks "Add New Staff Member"
5. Fills in name, email, and password
6. Staff account is created and can now login

### Deactivating Staff Accounts

Admins can deactivate (not delete) staff accounts:

1. Open the "Manage Staff" dialog for a restaurant
2. Click "Deactivate" next to a staff member
3. The staff member can no longer login
4. Their account record remains in the database for audit purposes

## Server Actions

### Admin Authentication (`app/actions/admin-auth.ts`)

- `adminLogin(email, password)` - Authenticate admin and create session
- `getAdminSession()` - Retrieve current admin session
- `adminLogout()` - Destroy admin session
- `createAdminAccount(email, password, name)` - Create new admin account

### Staff Authentication (`app/actions/user-auth.ts`)

- `userLogin(restaurantId, email, password)` - Authenticate staff member
- `getUserSession()` - Retrieve current staff session
- `userLogout()` - Destroy staff session
- `createUserAccount(restaurantId, email, password, name)` - Create new staff account
- `deactivateUserAccount(userId)` - Deactivate a staff account
- `getUsersForRestaurant(restaurantId)` - Get all staff for a restaurant
- `getRestaurantsForSelector()` - Get active restaurants for dropdown

## Session Management

### Session Storage

Sessions are stored in HTTP-only cookies:
- **Admin Cookie**: `admin_session`
- **Staff Cookie**: `user_session`

### Cookie Settings

```typescript
{
  httpOnly: true,              // Cannot be accessed by JavaScript
  secure: true,                // Only sent over HTTPS in production
  sameSite: 'lax',            // Prevents CSRF attacks
  maxAge: 60 * 60 * 24 * 7   // 7 days
}
```

### Session Token Format

Tokens are base64-encoded strings containing:
- User/Admin ID
- Timestamp
- Random nonce

Example: `YWRtaW5fMToxNjcwNDI4NDAwOjAuNTEyMzQ=`

## Password Security

Passwords are hashed using PBKDF2 (Password-Based Key Derivation Function 2):

```typescript
// Hashing
const salt = crypto.randomBytes(16).toString('hex')
const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex')
// Result: "salt:hash"

// Verification
const computed = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex')
// Compare: computed === storedHash
```

## Navigation Routes

### Public Routes
- `/` - Homepage
- `/admin-login` - Admin login
- `/user-login` - Staff login
- `/sign-up` - Create restaurant account (legacy Better Auth)
- `/sign-in` - Restaurant owner login (legacy Better Auth)

### Protected Routes (Admin)
- `/admin-dashboard` - Admin dashboard (requires admin session)

### Protected Routes (Staff)
- `/user/dashboard` - Staff dashboard (requires staff session)
- `/admin/restaurants/[id]` - Menu editor (requires staff session with access)

## Migration from Legacy Auth

The system supports both:
1. **New Dual Auth**: Admin and Staff accounts (sessions)
2. **Legacy Better Auth**: Restaurant owners (Better Auth sessions)

These are independent systems. Users cannot be both a Better Auth user and an Admin/Staff account simultaneously.

## Future Enhancements

Potential improvements:
- Two-factor authentication for admins
- Email verification for new staff accounts
- Password reset flows
- Admin audit logs
- Permission-based access control (super-admin, admin, manager, staff roles)
- OAuth integration for enterprise deployments
