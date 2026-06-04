# QuickMenu - Architecture & Components

## System Overview

QuickMenu is a full-stack Next.js application for managing digital QR code menus for restaurants. The system is built with:

- **Frontend**: React 19 components with Tailwind CSS
- **Backend**: Next.js Server Actions and API routes
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Auth**: Better Auth with email/password
- **Deployment**: Vercel

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ React 19 Components                                  │  │
│  │ - HomePage (landing)                                 │  │
│  │ - AuthForm (sign-in/up)                             │  │
│  │ - Admin Dashboard                                    │  │
│  │ - Menu Viewer (public)                              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────┬─────────────────────────────────────────────┘
                 │ HTTP/HTTPS
┌────────────────▼─────────────────────────────────────────────┐
│            Next.js 16 Server (localhost:3000)               │
│                                                             │
│  Routes:                                                    │
│  ├── GET  /                 → HomePage                     │
│  ├── GET  /sign-in          → SignInPage                   │
│  ├── GET  /sign-up          → SignUpPage                   │
│  ├── GET  /admin            → Dashboard (protected)        │
│  ├── GET  /admin/[id]       → RestaurantEditor (protected) │
│  ├── GET  /menu/[slug]      → MenuViewer (public)          │
│  ├── POST /api/auth/*       → Better Auth Handler          │
│  │                                                         │
│  Server Actions (lib/):                                   │
│  ├── restaurants.ts                                        │
│  │   ├── getRestaurants()                                 │
│  │   ├── getRestaurant(id)                                │
│  │   ├── createRestaurant(data)                           │
│  │   ├── updateRestaurant(id, data)                       │
│  │   ├── deleteRestaurant(id)                             │
│  │   ├── getCategories(restaurantId)                      │
│  │   ├── createCategory(restaurantId, name)               │
│  │   ├── updateCategory(id, data)                         │
│  │   ├── deleteCategory(id)                               │
│  │   ├── getMenuItems(restaurantId)                       │
│  │   ├── createMenuItem(restaurantId, categoryId, data)   │
│  │   ├── updateMenuItem(id, data)                         │
│  │   └── deleteMenuItem(id)                               │
│  │                                                         │
│  Auth (lib/):                                              │
│  ├── auth.ts (Better Auth server config)                  │
│  ├── auth-client.ts (Browser auth client)                 │
│  └── db/ (Drizzle setup)                                  │
└────────────────┬─────────────────────────────────────────────┘
                 │ TCP Connection (pg protocol)
┌────────────────▼─────────────────────────────────────────────┐
│         Neon PostgreSQL Database                            │
│                                                             │
│  Tables:                                                    │
│  ├── user (Better Auth)                                    │
│  │   ├── id (UUID)                                        │
│  │   ├── email                                            │
│  │   ├── name                                             │
│  │   ├── emailVerified                                    │
│  │   └── timestamps                                       │
│  │                                                         │
│  ├── session (Better Auth)                                │
│  ├── account (Better Auth)                                │
│  ├── verification (Better Auth)                           │
│  │                                                         │
│  ├── restaurants (App)                                     │
│  │   ├── id (serial)                                      │
│  │   ├── userId (from user)                               │
│  │   ├── name                                             │
│  │   ├── description                                      │
│  │   ├── cuisineType                                      │
│  │   ├── imageUrl                                         │
│  │   ├── qrCode (data URL)                               │
│  │   ├── restaurantUrl (unique slug)                      │
│  │   ├── isActive                                         │
│  │   └── timestamps                                       │
│  │                                                         │
│  ├── menu_categories (App)                                │
│  │   ├── id                                               │
│  │   ├── restaurantId → restaurants.id                    │
│  │   ├── userId                                           │
│  │   ├── name                                             │
│  │   ├── displayOrder                                     │
│  │   ├── isActive                                         │
│  │   └── timestamps                                       │
│  │                                                         │
│  ├── menu_items (App)                                      │
│  │   ├── id                                               │
│  │   ├── categoryId → menu_categories.id                  │
│  │   ├── restaurantId → restaurants.id                    │
│  │   ├── userId                                           │
│  │   ├── name                                             │
│  │   ├── description                                      │
│  │   ├── price (decimal)                                  │
│  │   ├── oldPrice (for sales)                             │
│  │   ├── imageUrl                                         │
│  │   ├── isAvailable                                      │
│  │   ├── displayOrder                                     │
│  │   └── timestamps                                       │
│  │                                                         │
│  └── menu_items_translations (Future)                      │
│      ├── id                                                │
│      ├── menuItemId → menu_items.id                       │
│      ├── language                                          │
│      ├── name                                              │
│      └── description                                       │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### Admin Components

```
AdminDashboard
├── Navigation (with auth)
├── RestaurantCardGrid
│   └── RestaurantCard (each restaurant)
│       ├── Restaurant image
│       ├── Basic info
│       └── QR code preview
└── CreateRestaurantDialog
    └── Form inputs

RestaurantEditor
├── Restaurant editor form
├── QR code display & sharing
└── MenuManager
    ├── CategoryList
    │   └── CategorySection (expandable)
    │       ├── MenuItem (each item)
    │       │   ├── Item info (name, price, description)
    │       │   ├── Availability toggle
    │       │   └── Delete button
    │       └── Add Item button
    └── Add Category form
```

### Public Components

```
MenuViewer
├── Restaurant Header
│   ├── Restaurant name & description
│   └── Restaurant image
├── CategoryNavigation (sticky)
│   └── Category buttons
└── MenuItemsGrid
    └── MenuItem (for each category)
        ├── Item image
        ├── Name & description
        ├── Price (and old price if on sale)
        └── Availability badge
```

### Auth Components

```
HomePage
├── Navigation (with auth-aware buttons)
├── HeroSection
├── FeaturesSection
├── HowItWorksSection
└── CTASection

AuthForm (shared)
├── Email input
├── Password input
├── Submit button
└── Link to other auth page

SignInPage → AuthForm (mode: sign-in)
SignUpPage → AuthForm (mode: sign-up)
```

## Data Flow

### Creating a Restaurant

```
User Input
    ↓
CreateRestaurantDialog component
    ↓
Call createRestaurant() server action
    ↓
Server validates userId + data
    ↓
Generate unique slug + QR code
    ↓
INSERT into restaurants table
    ↓
Revalidate /admin path
    ↓
Redirect to /admin/restaurants/[id]
```

### Viewing a Menu (Public)

```
User scans QR code or visits /menu/[slug]
    ↓
MenuPage server component
    ↓
Query restaurants table by restaurantUrl
    ↓
Query menu_categories + menu_items
    ↓
Render MenuViewer component
    ↓
User sees beautiful mobile-friendly menu
```

### Updating Menu Items

```
Restaurant owner clicks item
    ↓
Menu item editor form
    ↓
Call updateMenuItem() server action
    ↓
Server validates userId (ownership check)
    ↓
UPDATE menu_items table
    ↓
Revalidate /admin + /menu/[slug]
    ↓
Changes appear immediately for customers
```

## Security Considerations

### Authentication
- Better Auth handles password hashing and session management
- Sessions stored in Neon with encrypted tokens
- CSRF protection via Better Auth
- Same-site cookies in development for iframe testing

### Authorization
- Every query filters by `userId` (no RLS, manual per-query)
- Pattern: `where(and(eq(table.id, id), eq(table.userId, userId)))`
- Prevents users from accessing other user's restaurants
- Server actions verify session before allowing mutations

### Database
- All queries use parameterized statements (Drizzle ORM)
- No raw SQL user input allowed
- Sensitive data (passwords) handled by Better Auth
- Unique constraints on URLs and translations

## Performance Optimizations

1. **Server Components**: Most pages are server components (instant)
2. **Revalidation**: Strategic use of `revalidatePath()` for updates
3. **Database Indexes**: 
   - `idx_restaurants_userId`
   - `idx_menu_categories_restaurantId`
   - `idx_menu_items_categoryId`
   - `idx_menu_items_restaurantId`
4. **Images**: Next.js Image component with optimization
5. **QR Codes**: Generated once, stored as data URL

## Deployment Checklist

- [ ] `DATABASE_URL` set to Neon database
- [ ] `BETTER_AUTH_SECRET` generated (32+ chars)
- [ ] `BETTER_AUTH_URL` or `VERCEL_URL` configured
- [ ] Database tables created
- [ ] Email sender configured (for verification)
- [ ] Environment variables synced to production

## Future Enhancements

1. **Multi-language Support**: Use `menu_items_translations` table
2. **Image Uploads**: Integrate with Vercel Blob storage
3. **Analytics**: Track menu views, popular items
4. **Webhooks**: Notify integrations of menu changes
5. **API**: Build GraphQL/REST API for external integrations
6. **Mobile App**: Share same PostgreSQL database
7. **Payments**: Stripe integration for online ordering
8. **Reservations**: Table booking system
9. **Ratings**: Customer reviews per menu item
10. **Templates**: Pre-designed menu layouts

## Key Files Summary

| File | Purpose |
|------|---------|
| `lib/db/schema.ts` | 80 lines - All table definitions with relations |
| `lib/auth.ts` | 50 lines - Better Auth configuration |
| `app/actions/restaurants.ts` | 260 lines - All business logic |
| `app/admin/page.tsx` | 45 lines - Dashboard |
| `app/admin/restaurants/[id]/page.tsx` | 40 lines - Editor |
| `app/menu/[slug]/page.tsx` | 45 lines - Public menu |
| `components/admin/menu-manager.tsx` | 215 lines - Menu UI |
| `components/menu/menu-viewer.tsx` | 150 lines - Display UI |
| `README.md` | 190 lines - Full documentation |

**Total App Code**: ~2,500 lines (including comments & whitespace)
**Database Relationships**: 4 core tables + 4 Better Auth tables
**API Routes**: 1 catch-all auth route + 9 server actions
**Pages**: 7 main pages + public menu
