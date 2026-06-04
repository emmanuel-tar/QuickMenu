# QuickMenu - Digital QR Code Menu System

A modern, full-stack application for restaurants to create and manage digital QR code menus. Built with Next.js 16, Neon PostgreSQL, and Better Auth.

## Features

- 🎫 **QR Code Generation** - Automatically generate unique QR codes for each restaurant
- 📱 **Responsive Menu Viewer** - Beautiful, mobile-first menu display
- 👨‍💼 **Dual Admin System** - Separate admin and staff authentication flows
- 🔐 **Secure Authentication** - Multiple auth systems: Admin/Staff (session-based) + Better Auth
- 📊 **Real-Time Updates** - Update menus instantly, changes appear immediately
- 🏷️ **Price Management** - Show old prices, mark items as unavailable
- 🌍 **Multi-Restaurant Support** - Admins manage multiple restaurants and staff accounts

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with email/password
- **QR Generation**: qrcode library
- **Deployment**: Vercel

## Project Structure

```
app/
  ├── page.tsx                          # Landing page
  ├── admin-login/page.tsx              # Admin login
  ├── admin-dashboard/page.tsx          # Admin dashboard
  ├── user-login/page.tsx               # Staff login
  ├── user/dashboard/page.tsx           # Staff dashboard
  ├── sign-in/page.tsx                  # Restaurant owner sign-in (Better Auth)
  ├── sign-up/page.tsx                  # Restaurant owner sign-up (Better Auth)
  ├── admin/
  │   ├── page.tsx                      # Owner dashboard
  │   └── restaurants/[id]/page.tsx     # Menu editor
  ├── menu/[slug]/page.tsx              # Public menu viewer
  ├── api/auth/[...all]/route.ts        # Better Auth handler
  └── actions/
      ├── admin-auth.ts                 # Admin authentication
      ├── user-auth.ts                  # Staff authentication
      └── restaurants.ts                # Restaurant management

lib/
  ├── auth.ts                           # Better Auth config
  ├── auth-client.ts                    # Better Auth client
  ├── password.ts                       # Password hashing utilities
  └── db/
      ├── index.ts                      # Drizzle setup
      └── schema.ts                     # Database schema (with admin/user tables)

components/
  ├── admin/
  │   ├── create-restaurant-dialog.tsx  # Create restaurant modal
  │   ├── restaurant-card.tsx           # Restaurant card component
  │   ├── restaurant-editor.tsx         # Edit restaurant details
  │   ├── menu-manager.tsx              # Manage menu categories/items
  │   └── manage-users-dialog.tsx       # Staff account management
  ├── auth-form.tsx                     # Better Auth form
  └── menu/
      └── menu-viewer.tsx               # Public menu display
```

## Database Schema

### Better Auth Tables (Legacy)
- `user` - Restaurant owner accounts
- `session` - Better Auth sessions
- `account` - OAuth accounts (future)
- `verification` - Email verification tokens

### Admin & Staff Authentication
- `admin_accounts` - System administrator accounts
- `user_accounts` - Restaurant staff accounts (scoped per restaurant)

### App Tables
- `restaurants` - Restaurant information
- `menu_categories` - Menu sections (Appetizers, Main Courses, etc.)
- `menu_items` - Individual menu items with pricing
- `menu_items_translations` - Multi-language support (future)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/emmanuel-tar/QuickMenu.git
cd QuickMenu
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Then update `.env.local` with your values:
```
DATABASE_URL=your_neon_postgres_url
BETTER_AUTH_SECRET=generate_with_openssl_rand_-base64_32
```

4. Create database tables:
The tables will be created automatically when you set up Neon through the Vercel dashboard. If needed, run:
```bash
node scripts/create-schema.js
```

5. Run the development server:
```bash
pnpm dev
```

Visit `http://localhost:3000` to see the app.

## Authentication System

QuickMenu features a **dual authentication system** with three independent login flows:

### Admin Login (`/admin-login`)
- For system administrators managing restaurants and staff
- Create and manage staff accounts
- View all restaurants
- Secure session-based authentication

### Staff Login (`/user-login`)
- For restaurant employees
- Select restaurant from dropdown
- Access menus and manage items
- Session-based per-restaurant access

### Restaurant Owner Account (`/sign-up` and `/sign-in`)
- Original Better Auth system
- Create and manage your own restaurants
- Independent from admin/staff accounts

For detailed authentication documentation, see:
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Technical overview
- **[SETUP_AUTHENTICATION.md](./SETUP_AUTHENTICATION.md)** - Setup and deployment guide
- **[AUTH_SYSTEM_SUMMARY.md](./AUTH_SYSTEM_SUMMARY.md)** - Architecture and features

## Usage

### For System Admins

1. **Login**: Go to `/admin-login` with admin credentials
2. **Manage Restaurants**: View all restaurants on the admin dashboard
3. **Create Staff Accounts**: 
   - Click "Manage Staff" on any restaurant
   - Click "+ Add New Staff Member"
   - Enter name, email, and password
4. **Monitor Access**: Deactivate staff accounts when needed

### For Staff Members

1. **Login**: Go to `/user-login`
2. **Select Restaurant**: Choose your restaurant from the dropdown
3. **Manage Menu**: Edit categories, items, prices, and availability
4. **View Menu**: See how the menu appears to customers

### For Restaurant Owners

1. **Sign Up**: Create an account at the landing page
2. **Create Restaurant**: Add your restaurant with name, cuisine type, and description
3. **Build Menu**: 
   - Add menu categories (Appetizers, Main Courses, Desserts, etc.)
   - Add items to each category with prices and descriptions
4. **Get QR Code**: Each restaurant has a unique QR code you can print or display
5. **Share**: Customers scan the QR code to view your digital menu

### For Customers

1. **Scan QR Code**: Use any phone camera to scan the restaurant's QR code
2. **View Menu**: See beautifully formatted menu with items, prices, and descriptions
3. **Check Availability**: See which items are temporarily unavailable

## Development

### Database Migrations

Schema changes are made directly through Neon's SQL interface. After making changes, the app will automatically use the updated schema through Drizzle ORM.

### Adding Features

Key files for extending the app:
- `lib/db/schema.ts` - Add new tables here
- `app/actions/restaurants.ts` - Add server actions
- `components/` - Add new UI components
- `app/` - Add new pages/routes

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `BETTER_AUTH_SECRET` | Authentication secret (32+ chars) | ✅ |
| `BETTER_AUTH_URL` | Auth base URL | ❌ |
| `NEXT_PUBLIC_APP_URL` | Public app URL | ❌ |

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

The app will automatically deploy with zero-config support for Next.js.

## Future Enhancements

- [ ] Multi-language menu support
- [ ] Image uploads for menu items and restaurants
- [ ] Analytics dashboard (views, popular items)
- [ ] Menu templates
- [ ] Social media integration
- [ ] Reservations system
- [ ] Order management
- [ ] Payment integration
- [ ] Admin notifications

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with ❤️ for restaurants going digital
