import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createKeycloakAdminClient } from '@/lib/keycloak-admin'

/**
 * GET /api/admin/users/[userId]
 * Get a specific user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create Keycloak admin client
    const keycloakAdmin = createKeycloakAdminClient()

    // Get user by ID
    const user = await keycloakAdmin.getUserById(userId)

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Error getting user:', error)

    // Check if it's a 404 error
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to get user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[userId]
 * Delete a user from Keycloak
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create Keycloak admin client
    const keycloakAdmin = createKeycloakAdminClient()

    // Check if user exists before deletion
    try {
      await keycloakAdmin.getUserById(userId)
    } catch (error) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user
    await keycloakAdmin.deleteUser(userId)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      userId,
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/users/[userId]
 * Update a user's information
 *
 * Request body can include:
 * {
 *   email?: string
 *   firstName?: string
 *   lastName?: string
 *   enabled?: boolean
 *   emailVerified?: boolean
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email, firstName, lastName, enabled, emailVerified } = body

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
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

    // Prepare update data (only include fields that were provided)
    const updates: any = {}
    if (email !== undefined) updates.email = email
    if (firstName !== undefined) updates.firstName = firstName
    if (lastName !== undefined) updates.lastName = lastName
    if (enabled !== undefined) updates.enabled = enabled
    if (emailVerified !== undefined) updates.emailVerified = emailVerified

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update user
    await keycloakAdmin.updateUser(userId, updates)

    // Get updated user details
    const updatedUser = await keycloakAdmin.getUserById(userId)

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      {
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
