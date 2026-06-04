'use server'

import { db } from '@/lib/db'
import { userAccounts, restaurants } from '@/lib/db/schema'
import { hashPassword, verifyPassword } from '@/lib/password'
import { eq, and } from 'drizzle-orm'
import { cookies } from 'next/headers'

const USER_SESSION_COOKIE = 'user_session'

export interface UserSession {
  id: number
  email: string
  name: string | null
  restaurantId: number
  restaurantName: string
}

/**
 * Get all restaurants for the dropdown selector
 */
export async function getRestaurantsForSelector(): Promise<
  Array<{ id: number; name: string }>
> {
  try {
    const restaurantList = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
      })
      .from(restaurants)
      .where(eq(restaurants.isActive, true))
      .orderBy(restaurants.name)

    return restaurantList
  } catch (error) {
    console.error('[v0] Get restaurants error:', error)
    return []
  }
}

/**
 * User login - verify restaurant, email, and password
 */
export async function userLogin(
  restaurantId: number,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userAccount = await db
      .select()
      .from(userAccounts)
      .where(
        and(
          eq(userAccounts.restaurantId, restaurantId),
          eq(userAccounts.email, email),
          eq(userAccounts.isActive, true)
        )
      )
      .limit(1)

    if (!userAccount || userAccount.length === 0) {
      return { success: false, error: 'Invalid credentials or account inactive' }
    }

    const passwordMatch = await verifyPassword(
      password,
      userAccount[0].passwordHash
    )
    if (!passwordMatch) {
      return { success: false, error: 'Invalid credentials or account inactive' }
    }

    // Create a session token
    const sessionToken = Buffer.from(
      `${userAccount[0].id}:${restaurantId}:${Date.now()}:${Math.random()}`
    ).toString('base64')

    // Set secure cookie
    const cookieStore = await cookies()
    cookieStore.set(USER_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
  } catch (error) {
    console.error('[v0] User login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

/**
 * Get current user session
 */
export async function getUserSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(USER_SESSION_COOKIE)?.value

    if (!sessionToken) {
      return null
    }

    const [userIdStr, restaurantIdStr] = Buffer.from(sessionToken, 'base64')
      .toString()
      .split(':')

    const userId = parseInt(userIdStr)
    const restaurantId = parseInt(restaurantIdStr)

    const userAccount = await db
      .select()
      .from(userAccounts)
      .where(eq(userAccounts.id, userId))
      .limit(1)

    if (!userAccount || userAccount.length === 0) {
      return null
    }

    const restaurant = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, restaurantId))
      .limit(1)

    if (!restaurant || restaurant.length === 0) {
      return null
    }

    return {
      id: userAccount[0].id,
      email: userAccount[0].email,
      name: userAccount[0].name,
      restaurantId: restaurant[0].id,
      restaurantName: restaurant[0].name,
    }
  } catch (error) {
    console.error('[v0] Get user session error:', error)
    return null
  }
}

/**
 * User logout
 */
export async function userLogout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(USER_SESSION_COOKIE)
}

/**
 * Get users for a restaurant (admin only)
 */
export async function getUsersForRestaurant(
  restaurantId: number
): Promise<
  Array<{ id: number; email: string; name: string | null; isActive: boolean }>
> {
  try {
    const users = await db
      .select({
        id: userAccounts.id,
        email: userAccounts.email,
        name: userAccounts.name,
        isActive: userAccounts.isActive,
      })
      .from(userAccounts)
      .where(eq(userAccounts.restaurantId, restaurantId))
      .orderBy(userAccounts.email)

    return users
  } catch (error) {
    console.error('[v0] Get restaurant users error:', error)
    return []
  }
}

/**
 * Create a new user account for a restaurant (admin only)
 */
export async function createUserAccount(
  restaurantId: number,
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user already exists for this restaurant
    const existing = await db
      .select()
      .from(userAccounts)
      .where(
        and(
          eq(userAccounts.restaurantId, restaurantId),
          eq(userAccounts.email, email)
        )
      )
      .limit(1)

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: 'User with this email already exists for this restaurant',
      }
    }

    const passwordHash = await hashPassword(password)

    await db.insert(userAccounts).values({
      restaurantId,
      email,
      passwordHash,
      name,
      isActive: true,
    })

    return { success: true }
  } catch (error) {
    console.error('[v0] Create user account error:', error)
    return { success: false, error: 'Failed to create user account' }
  }
}

/**
 * Deactivate a user account
 */
export async function deactivateUserAccount(
  userId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(userAccounts)
      .set({ isActive: false })
      .where(eq(userAccounts.id, userId))

    return { success: true }
  } catch (error) {
    console.error('[v0] Deactivate user error:', error)
    return { success: false, error: 'Failed to deactivate user' }
  }
}
