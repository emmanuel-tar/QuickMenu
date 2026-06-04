# Admin Setup Guide

## Quick Setup for Emmanuel

The system includes a quick setup button to create the admin account with the following credentials:

- **Email:** admin@qmenu.com
- **Password:** admin123
- **Name:** Emmanuel

### Steps to Setup

1. **Visit the Setup Page**
   - Go to `/admin-setup` on your deployed application
   - Or click "Setup Admin Account" button on the homepage

2. **Quick Setup Option**
   - Click the "Quick Setup (Emmanuel Account)" button
   - The system will create the admin account automatically
   - You'll be redirected to the login page

3. **Login**
   - Go to `/admin-login`
   - Enter email: `admin@qmenu.com`
   - Enter password: `admin123`
   - Click "Sign In"

4. **Start Managing**
   - You're now in the admin dashboard
   - View all restaurants in the system
   - Create staff accounts for each restaurant
   - Manage restaurant operations

## Custom Admin Account

If you want to create a different admin account:

1. **Visit `/admin-setup`**
2. **Click "Continue with Custom Account"**
3. **Fill in the form:**
   - Full Name
   - Email address
   - Password (at least 8 characters)
   - Confirm password
4. **Click "Create Admin Account"**
5. **Login at `/admin-login`** with your credentials

## Password Security

Admin accounts use PBKDF2 hashing with:
- 1000 iterations
- 16-byte random salt
- SHA256 algorithm
- 64-byte hash output

This is industry-standard password security suitable for production use.

## What Can Admins Do?

Once logged in as admin, you can:

### Restaurant Management
- View all restaurants in the system
- Edit restaurant details
- View restaurant menus
- Deactivate restaurants (reversible)

### Staff Account Management
- Create staff accounts for any restaurant
- Assign staff to specific restaurants
- Set staff passwords
- View all staff members
- Deactivate staff accounts
- Update staff information

### Menu Management (Via Staff)
- Guide staff on menu creation
- Review menu structures
- Monitor menu items and pricing

## Troubleshooting

### "Admin account already exists"
- The admin account `admin@qmenu.com` already exists in the database
- Go directly to `/admin-login` and login with your credentials
- If you forgot the password, contact system administrator

### "Failed to create admin account"
- Check your internet connection
- Ensure the database is properly set up
- Try again after a few moments
- Check browser console (F12) for error details

### Password Hash Generation

If you need to manually create an admin account from SQL:

1. Run: `node scripts/create-admin.js`
2. This generates a password hash for "admin123"
3. Use the SQL provided to insert directly into database:

```sql
INSERT INTO admin_accounts (email, "passwordHash", name) 
VALUES ('admin@qmenu.com', '[hash-from-script]', 'Emmanuel');
```

## Direct SQL Method

If the web interface fails, you can insert directly into the database:

```sql
INSERT INTO admin_accounts (email, "passwordHash", name) 
VALUES (
  'admin@qmenu.com',
  '2170c8e018042dc4265fc0952d6e4739:3dc1388eeda5373347e5efb7042b360311a005475440cf9a28eb93f903809e9ffdbbc33dd172fa14ebdc097f4994428358f97478a0d5af2612c70550eb4b86c3',
  'Emmanuel'
);
```

This password hash corresponds to the password: `admin123`

## Session Management

Admin sessions:
- Last for 7 days
- Are stored in secure HTTP-only cookies
- Cannot be accessed by JavaScript
- Are automatically cleared on logout

## Next Steps After Setup

1. **Login to Admin Dashboard**
   - Go to `/admin-login`
   - Enter your credentials

2. **Manage Restaurants**
   - View all restaurants
   - Click on a restaurant to edit details

3. **Create Staff Accounts**
   - Click "Manage Staff" button on any restaurant
   - Click "+ Add New Staff Member"
   - Enter staff name, email, and password
   - Staff can now login at `/user-login`

4. **Monitor the System**
   - Check staff activities
   - Review restaurant details
   - Manage menu items and pricing

## Security Best Practices

1. **Change Default Password**
   - After setup, login and change the password from "admin123"
   - Use a strong, unique password
   - Don't share admin credentials

2. **HTTPS Only**
   - Always use HTTPS in production
   - Never use HTTP for admin accounts
   - Enable HSTS headers

3. **Regular Audits**
   - Regularly review staff accounts
   - Deactivate unused accounts
   - Monitor login activities

4. **Strong Passwords**
   - Require staff to use strong passwords
   - Passwords should be at least 12 characters
   - Include special characters and numbers

## API Endpoint

For programmatic account creation:

```bash
POST /api/admin/setup
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "secure_password_123",
  "name": "Admin Name"
}
```

Response on success:
```json
{
  "success": true,
  "message": "Admin account created successfully for admin@example.com"
}
```

Response on error:
```json
{
  "success": false,
  "error": "Admin with this email already exists"
}
```

## Support

For issues with admin setup:

1. Check the browser console (F12) for errors
2. Verify database connection
3. Ensure admin_accounts table exists
4. Check file permissions
5. Review application logs

---

For more information, see:
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Technical authentication details
- [SETUP_AUTHENTICATION.md](./SETUP_AUTHENTICATION.md) - Full auth setup guide
- [README.md](./README.md) - Project overview
