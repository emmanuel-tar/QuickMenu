# QuickMenu - Digital QR Code Menu System

A modern, full-stack application for restaurants to create and manage digital QR code menus. Built with Next.js 16, Neon PostgreSQL, and Better Auth.

## Features

- 🎫 **QR Code Generation** - Automatically generate unique QR codes for each restaurant
- 📱 **Responsive Menu Viewer** - Beautiful, mobile-first menu display
- 👨‍💼 **Admin Dashboard** - Manage multiple restaurants, categories, and menu items
- 🔐 **Secure Authentication** - Email/password auth with Better Auth and Neon
- 📊 **Real-Time Updates** - Update menus instantly, changes appear immediately
- 🏷️ **Price Management** - Show old prices, mark items as unavailable
- 🌍 **Multi-Restaurant Support** - Manage unlimited restaurants from one account

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
  ├── sign-in/page.tsx                  # Sign-in page
  ├── sign-up/page.tsx                  # Sign-up page
  ├── admin/
  │   ├── page.tsx                      # Admin dashboard
  │   └── restaurants/[id]/page.tsx     # Restaurant editor
  ├── menu/[slug]/page.tsx              # Public menu viewer
  ├── api/auth/[...all]/route.ts        # Better Auth handler
  └── actions/restaurants.ts            # Server actions

lib/
  ├── auth.ts                           # Better Auth config
  ├── auth-client.ts                    # Better Auth client
  └── db/
      ├── index.ts                      # Drizzle setup
      └── schema.ts                     # Database schema

components/
  ├── admin/
  │   ├── create-restaurant-dialog.tsx  # Create restaurant modal
  │   ├── restaurant-card.tsx           # Restaurant card component
  │   ├── restaurant-editor.tsx         # Edit restaurant details
  │   └── menu-manager.tsx              # Manage menu categories/items
  └── menu/
      └── menu-viewer.tsx               # Public menu display
```

## Database Schema

### Better Auth Tables
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth accounts (future)
- `verification` - Email verification tokens

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

## Usage

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
