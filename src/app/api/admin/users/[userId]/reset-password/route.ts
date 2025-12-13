import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createKeycloakAdminClient } from '@/lib/keycloak-admin'

/**
 * POST /api/admin/users/[userId]/reset-password
 * Reset a user's password
 *
 * Request body:
 * {
 *   password: string (required)
 *   temporary?: boolean (default: false) - if true, user must change password on next login
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { password, temporary } = body

    // Validate required fields
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Create Keycloak admin client
    const keycloakAdmin = createKeycloakAdminClient()

    // Check if user exists
    try {
      await keycloakAdmin.getUserById(userId)
    } catch (error) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Reset password
    await keycloakAdmin.resetPassword(
      userId,
      password,
      temporary !== undefined ? temporary : false
    )

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      userId,
      temporary: temporary !== undefined ? temporary : false,
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      {
        error: 'Failed to reset password',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
