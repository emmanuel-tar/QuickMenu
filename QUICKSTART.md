# QuickMenu - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install and Run

```bash
# Clone or install the project
git clone https://github.com/emmanuel-tar/QuickMenu.git
cd QuickMenu

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and BETTER_AUTH_SECRET
```

### 2. Generate Auth Secret

```bash
# Generate a secure secret (required)
openssl rand -base64 32
```

Add the output to your `.env.local` as `BETTER_AUTH_SECRET`.

### 3. Connect Database (Neon)

If you're using Neon:
1. Create a free account at https://neon.tech
2. Create a new project and database
3. Copy your connection string to `.env.local` as `DATABASE_URL`

### 4. Run the Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` in your browser.

## 📝 First Steps as a User

### Create Your First Restaurant

1. Click **Sign Up** on the homepage
2. Enter your email and create a password
3. Once signed in, click **Go to Dashboard**
4. Click **+ New Restaurant**
5. Fill in:
   - Restaurant Name (e.g., "Pizza Palace")
   - Cuisine Type (e.g., "Italian")
   - Description (optional)
6. Click **Create**

### Build Your Menu

1. On the restaurant page, scroll to **Menu** section
2. Click **Add New Category** to create sections:
   - Appetizers
   - Main Courses
   - Desserts
   - Beverages
3. For each category, click **+ Add Item**
4. Enter:
   - Item name (e.g., "Margherita Pizza")
   - Price (e.g., 12.99)

### Share Your Menu

1. Your restaurant has a unique QR code (visible in the editor)
2. Download/print the QR code or share the menu link
3. Customers scan and see your beautiful digital menu!

## 🔧 Project Structure

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Landing page |
| `app/admin/page.tsx` | Dashboard (all restaurants) |
| `app/admin/restaurants/[id]/page.tsx` | Edit restaurant & menu |
| `app/menu/[slug]/page.tsx` | Public menu viewer |
| `app/actions/restaurants.ts` | Server actions for all operations |
| `lib/db/schema.ts` | Database tables definition |
| `components/admin/` | Admin UI components |
| `components/menu/` | Menu display components |

## 📊 Database Tables

The system automatically creates:

- **restaurants** - Your restaurant info
- **menu_categories** - Menu sections (Appetizers, etc.)
- **menu_items** - Individual dishes with prices
- **user** - Your account (Better Auth)
- **session** - Login sessions (Better Auth)
- **account** - OAuth support (Better Auth)
- **verification** - Email verification (Better Auth)

## 🌐 Deploy to Vercel

1. Push to GitHub:
```bash
git push origin main
```

2. Import in Vercel:
   - Go to https://vercel.com/new
   - Select your GitHub repo
   - Add environment variables:
     - `DATABASE_URL` (Neon)
     - `BETTER_AUTH_SECRET` (generate new one)
   - Deploy!

## 🎯 Key Features to Try

- ✅ Create multiple restaurants
- ✅ Organize menu into categories
- ✅ Mark items as unavailable
- ✅ Show old prices (sale pricing)
- ✅ View your menu as a customer
- ✅ Share QR code with unique URL
- ✅ Instant updates (no cache)

## 🐛 Troubleshooting

### Database Connection Error
- Check `DATABASE_URL` is set correctly
- Verify database user has CREATE TABLE permissions

### Auth Secret Error
- Generate a new secret: `openssl rand -base64 32`
- Set `BETTER_AUTH_SECRET` in `.env.local`

### QR Code Not Generating
- Ensure `BETTER_AUTH_URL` is set (or leave blank for auto-detection)
- Check browser console for errors

### Pages Not Loading
- Run `pnpm dev` again
- Clear browser cache
- Check console for TypeScript/runtime errors

## 📚 Next Steps

1. **Customize**: Update colors/fonts in `tailwind.config.ts` and `globals.css`
2. **Add Images**: Upload restaurant and menu item images
3. **Analytics**: Track menu views per restaurant
4. **Integrations**: Add payment system for orders
5. **Mobile App**: Create native mobile app with same API

## 🆘 Need Help?

- Check README.md for full documentation
- Review code comments in key files
- Check environment variables are set
- Verify database connection works

## ✨ Pro Tips

- Use short, memorable restaurant URLs
- Include descriptions in menu items
- Update prices regularly
- Mark unavailable items during non-business hours
- Test on mobile before sharing QR code

---

Happy menu making! 🍕
