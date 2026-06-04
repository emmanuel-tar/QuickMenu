'use server'

import { db } from '@/lib/db'
import { adminAccounts } from '@/lib/db/schema'

export async function setupAdmin() {
  try {
    // Check if admin already exists
    const existing = await db.query.adminAccounts.findFirst({
      where: (accounts, { eq }) => eq(accounts.email, 'admin@qmenu.com'),
    })

    if (existing) {
      return {
        success: false,
        error: 'Admin account already exists',
        message: 'The admin account admin@qmenu.com already exists in the database.',
      }
    }

    // Insert the admin account
    // Password hash for "admin123": 2170c8e018042dc4265fc0952d6e4739:3dc1388eeda5373347e5efb7042b360311a005475440cf9a28eb93f903809e9ffdbbc33dd172fa14ebdc097f4994428358f97478a0d5af2612c70550eb4b86c3
    await db.insert(adminAccounts).values({
      email: 'admin@qmenu.com',
      passwordHash: '2170c8e018042dc4265fc0952d6e4739:3dc1388eeda5373347e5efb7042b360311a005475440cf9a28eb93f903809e9ffdbbc33dd172fa14ebdc097f4994428358f97478a0d5af2612c70550eb4b86c3',
      name: 'Emmanuel',
    })

    return {
      success: true,
      message: 'Admin account created successfully!',
      credentials: {
        email: 'admin@qmenu.com',
        password: 'admin123',
        name: 'Emmanuel',
      },
    }
  } catch (error) {
    console.error('[v0] Setup admin error:', error)
    return {
      success: false,
      error: 'Failed to create admin account',
      details: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
