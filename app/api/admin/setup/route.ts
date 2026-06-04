import { createAdminAccount } from '@/app/actions/admin-auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return Response.json(
        { success: false, error: 'Missing required fields: email, password, name' },
        { status: 400 }
      )
    }

    const result = await createAdminAccount(email, password, name)

    if (result.success) {
      return Response.json({
        success: true,
        message: `Admin account created successfully for ${email}`,
      })
    } else {
      return Response.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[v0] Setup error:', error)
    return Response.json(
      { success: false, error: 'Failed to create admin account' },
      { status: 500 }
    )
  }
}
