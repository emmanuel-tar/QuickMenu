import { pgTable, text, timestamp, boolean, serial, decimal, integer, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').notNull().primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').notNull().primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refreshToken: text('refreshToken'),
  accessToken: text('accessToken'),
  expiresAt: text('expiresAt'),
  tokenType: text('tokenType'),
  scope: text('scope'),
  idToken: text('idToken'),
  sessionState: text('sessionState'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').notNull().primaryKey(),
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

// QuickMenu App Tables
export const restaurants = pgTable('restaurants', {
  id: serial('id').notNull().primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  cuisineType: text('cuisineType'),
  imageUrl: text('imageUrl'),
  qrCode: text('qrCode'),
  restaurantUrl: text('restaurantUrl').unique(),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const menuCategories = pgTable('menu_categories', {
  id: serial('id').notNull().primaryKey(),
  restaurantId: integer('restaurantId').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  displayOrder: integer('displayOrder').notNull().default(0),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const menuItems = pgTable('menu_items', {
  id: serial('id').notNull().primaryKey(),
  categoryId: integer('categoryId').notNull().references(() => menuCategories.id, { onDelete: 'cascade' }),
  restaurantId: integer('restaurantId').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  oldPrice: decimal('oldPrice', { precision: 10, scale: 2 }),
  imageUrl: text('imageUrl'),
  isAvailable: boolean('isAvailable').notNull().default(true),
  displayOrder: integer('displayOrder').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const menuItemsTranslations = pgTable('menu_items_translations', {
  id: serial('id').notNull().primaryKey(),
  menuItemId: integer('menuItemId').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  language: text('language').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (table) => [
  unique().on(table.menuItemId, table.language),
])

// Relations
export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  categories: many(menuCategories),
  items: many(menuItems),
}))

export const categoriesRelations = relations(menuCategories, ({ one, many }) => ({
  restaurant: one(restaurants, { fields: [menuCategories.restaurantId], references: [restaurants.id] }),
  items: many(menuItems),
}))

export const itemsRelations = relations(menuItems, ({ one, many }) => ({
  category: one(menuCategories, { fields: [menuItems.categoryId], references: [menuCategories.id] }),
  restaurant: one(restaurants, { fields: [menuItems.restaurantId], references: [restaurants.id] }),
  translations: many(menuItemsTranslations),
}))

export const translationsRelations = relations(menuItemsTranslations, ({ one }) => ({
  item: one(menuItems, { fields: [menuItemsTranslations.menuItemId], references: [menuItems.id] }),
}))

// Admin Authentication Table
export const adminAccounts = pgTable('admin_accounts', {
  id: serial('id').notNull().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('passwordHash').notNull(),
  name: text('name'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// User/Staff Authentication Table
export const userAccounts = pgTable('user_accounts', {
  id: serial('id').notNull().primaryKey(),
  restaurantId: integer('restaurantId').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  passwordHash: text('passwordHash').notNull(),
  name: text('name'),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (table) => [
  unique().on(table.restaurantId, table.email),
])

// Relations for user accounts
export const userAccountsRelations = relations(userAccounts, ({ one }) => ({
  restaurant: one(restaurants, { fields: [userAccounts.restaurantId], references: [restaurants.id] }),
}))
