'use server'

import { db } from '@/lib/db'
import { adminAccounts } from '@/lib/db/schema'
import { hashPassword, verifyPassword } from '@/lib/password'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

const ADMIN_SESSION_COOKIE = 'admin_session'

export interface AdminSession {
  id: number
  email: string
  name: string | null
}

/**
 * Admin login - verify email and password
 */
export async function adminLogin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await db
      .select()
      .from(adminAccounts)
      .where(eq(adminAccounts.email, email))
      .limit(1)

    if (!admin || admin.length === 0) {
      return { success: false, error: 'Invalid email or password' }
    }

    const passwordMatch = await verifyPassword(
      password,
      admin[0].passwordHash
    )
    if (!passwordMatch) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Create a simple session token
    const sessionToken = Buffer.from(
      `${admin[0].id}:${Date.now()}:${Math.random()}`
    ).toString('base64')

    // Set secure cookie
    const cookieStore = await cookies()
    cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
  } catch (error) {
    console.error('[v0] Admin login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

/**
 * Get current admin session
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

    if (!sessionToken) {
      return null
    }

    // In a real app, you'd validate the token more securely
    const [adminIdStr] = Buffer.from(sessionToken, 'base64')
      .toString()
      .split(':')
    const adminId = parseInt(adminIdStr)

    const admin = await db
      .select()
      .from(adminAccounts)
      .where(eq(adminAccounts.id, adminId))
      .limit(1)

    if (!admin || admin.length === 0) {
      return null
    }

    return {
      id: admin[0].id,
      email: admin[0].email,
      name: admin[0].name,
    }
  } catch (error) {
    console.error('[v0] Get admin session error:', error)
    return null
  }
}

/**
 * Admin logout
 */
export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}

/**
 * Create a new admin account (only for initial setup or super admin)
 */
export async function createAdminAccount(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if admin already exists
    const existing = await db
      .select()
      .from(adminAccounts)
      .where(eq(adminAccounts.email, email))
      .limit(1)

    if (existing && existing.length > 0) {
      return { success: false, error: 'Admin with this email already exists' }
    }

    const passwordHash = await hashPassword(password)

    await db.insert(adminAccounts).values({
      email,
      passwordHash,
      name,
    })

    return { success: true }
  } catch (error) {
    console.error('[v0] Create admin account error:', error)
    return { success: false, error: 'Failed to create admin account' }
  }
}
