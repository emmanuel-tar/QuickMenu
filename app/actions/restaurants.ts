'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { restaurants, menuCategories, menuItems } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import QRCode from 'qrcode'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getRestaurants() {
  const userId = await getUserId()
  return db
    .select()
    .from(restaurants)
    .where(eq(restaurants.userId, userId))
    .orderBy(desc(restaurants.createdAt))
}

export async function getRestaurant(restaurantId: number) {
  const userId = await getUserId()
  const result = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, restaurantId), eq(restaurants.userId, userId)))
    .limit(1)
  return result[0] || null
}

export async function createRestaurant(data: {
  name: string
  description?: string
  cuisineType?: string
}) {
  const userId = await getUserId()
  
  // Generate unique URL slug
  const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const restaurantUrl = `${slug}-${Date.now()}`
  
  // Generate QR code
  const qrCode = await QRCode.toDataURL(`${process.env.BETTER_AUTH_URL || process.env.VERCEL_URL}/menu/${restaurantUrl}`)
  
  const result = await db
    .insert(restaurants)
    .values({
      userId,
      name: data.name,
      description: data.description,
      cuisineType: data.cuisineType,
      restaurantUrl,
      qrCode,
    })
    .returning()
  
  revalidatePath('/admin')
  return result[0]
}

export async function updateRestaurant(
  restaurantId: number,
  data: {
    name?: string
    description?: string
    cuisineType?: string
    imageUrl?: string
    isActive?: boolean
  }
) {
  const userId = await getUserId()
  
  const result = await db
    .update(restaurants)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(restaurants.id, restaurantId), eq(restaurants.userId, userId)))
    .returning()
  
  revalidatePath('/admin')
  revalidatePath(`/menu/${data.name}`)
  return result[0]
}

export async function deleteRestaurant(restaurantId: number) {
  const userId = await getUserId()
  
  await db
    .delete(restaurants)
    .where(and(eq(restaurants.id, restaurantId), eq(restaurants.userId, userId)))
  
  revalidatePath('/admin')
}

// Category actions
export async function getCategories(restaurantId: number) {
  const userId = await getUserId()
  return db
    .select()
    .from(menuCategories)
    .where(and(
      eq(menuCategories.restaurantId, restaurantId),
      eq(menuCategories.userId, userId)
    ))
    .orderBy(menuCategories.displayOrder)
}

export async function createCategory(restaurantId: number, data: { name: string }) {
  const userId = await getUserId()
  
  // Verify restaurant ownership
  const restaurant = await getRestaurant(restaurantId)
  if (!restaurant) throw new Error('Restaurant not found')
  
  const result = await db
    .insert(menuCategories)
    .values({
      restaurantId,
      userId,
      name: data.name,
      displayOrder: 0,
    })
    .returning()
  
  revalidatePath(`/admin/restaurants/${restaurantId}`)
  return result[0]
}

export async function updateCategory(
  categoryId: number,
  data: { name?: string; displayOrder?: number; isActive?: boolean }
) {
  const userId = await getUserId()
  
  const result = await db
    .update(menuCategories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(
      eq(menuCategories.id, categoryId),
      eq(menuCategories.userId, userId)
    ))
    .returning()
  
  revalidatePath('/admin')
  return result[0]
}

export async function deleteCategory(categoryId: number) {
  const userId = await getUserId()
  
  await db
    .delete(menuCategories)
    .where(and(
      eq(menuCategories.id, categoryId),
      eq(menuCategories.userId, userId)
    ))
  
  revalidatePath('/admin')
}

// Menu items actions
export async function getMenuItems(restaurantId: number) {
  const userId = await getUserId()
  return db
    .select()
    .from(menuItems)
    .where(and(
      eq(menuItems.restaurantId, restaurantId),
      eq(menuItems.userId, userId)
    ))
    .orderBy(menuItems.displayOrder)
}

export async function createMenuItem(
  restaurantId: number,
  categoryId: number,
  data: {
    name: string
    description?: string
    price: string
    oldPrice?: string
  }
) {
  const userId = await getUserId()
  
  // Verify restaurant ownership
  const restaurant = await getRestaurant(restaurantId)
  if (!restaurant) throw new Error('Restaurant not found')
  
  const result = await db
    .insert(menuItems)
    .values({
      restaurantId,
      categoryId,
      userId,
      name: data.name,
      description: data.description,
      price: data.price,
      oldPrice: data.oldPrice,
      displayOrder: 0,
    })
    .returning()
  
  revalidatePath(`/admin/restaurants/${restaurantId}`)
  return result[0]
}

export async function updateMenuItem(
  menuItemId: number,
  data: {
    name?: string
    description?: string
    price?: string
    oldPrice?: string
    imageUrl?: string
    isAvailable?: boolean
    displayOrder?: number
  }
) {
  const userId = await getUserId()
  
  const result = await db
    .update(menuItems)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(
      eq(menuItems.id, menuItemId),
      eq(menuItems.userId, userId)
    ))
    .returning()
  
  revalidatePath('/admin')
  return result[0]
}

export async function deleteMenuItem(menuItemId: number) {
  const userId = await getUserId()
  
  await db
    .delete(menuItems)
    .where(and(
      eq(menuItems.id, menuItemId),
      eq(menuItems.userId, userId)
    ))
  
  revalidatePath('/admin')
}
