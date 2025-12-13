import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createKeycloakAdminClient, KeycloakUser } from '@/lib/keycloak-admin'

/**
 * GET /api/admin/users
 * List all users in the realm
 *
 * Query parameters:
 * - first: First result to return (default: 0)
 * - max: Maximum number of results (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const first = parseInt(searchParams.get('first') || '0', 10)
    const max = parseInt(searchParams.get('max') || '100', 10)

    // Create Keycloak admin client
    const keycloakAdmin = createKeycloakAdminClient()

    // List users
    const users = await keycloakAdmin.listUsers(first, max)

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        first,
        max,
        count: users.length,
      },
    })
  } catch (error) {
    console.error('Error listing users:', error)
    return NextResponse.json(
      {
        error: 'Failed to list users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/users
 * Create a new user in Keycloak
 *
 * Request body:
 * {
 *   username: string (required)
 *   email: string (required)
 *   firstName?: string
 *   lastName?: string
 *   password?: string
 *   enabled?: boolean (default: true)
 *   emailVerified?: boolean (default: false)
 *   temporary?: boolean (default: false) - if true, user must change password on first login
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { username, email, firstName, lastName, password, enabled, emailVerified, temporary } = body

    // Validate required fields
    if (!username || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: username and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create Keycloak admin client
    const keycloakAdmin = createKeycloakAdminClient()

    // Check if user already exists
    const existingUsers = await keycloakAdmin.getUsersByUsername(username)
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this username already exists' },
        { status: 409 }
      )
    }

    // Check if email already exists
    const existingEmailUsers = await keycloakAdmin.getUsersByEmail(email)
    if (existingEmailUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Prepare user data
    const userData: KeycloakUser = {
      username,
      email,
      firstName,
      lastName,
      enabled: enabled !== undefined ? enabled : true,
      emailVerified: emailVerified !== undefined ? emailVerified : false,
    }

    // Add password if provided
    if (password) {
      userData.credentials = [
        {
          type: 'password',
          value: password,
          temporary: temporary !== undefined ? temporary : false,
        },
      ]
    }

    // Create user
    const userId = await keycloakAdmin.createUser(userData)

    // Get the created user details
    const createdUser = await keycloakAdmin.getUserById(userId)

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: createdUser,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      {
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
