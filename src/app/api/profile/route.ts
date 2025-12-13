import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getUserProfile, createUserProfile, updateUserProfile } from '@/lib/user-profile'

/**
 * GET /api/profile
 * Get the current user's profile
 */
export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get Keycloak user ID from session
    const keycloakId = (session.user as any).sub
    if (!keycloakId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      )
    }

    // Get user profile
    const profile = await getUserProfile(keycloakId)

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        keycloakId: profile.keycloakId,
        nickname: profile.nickname,
        avatarUrl: profile.avatarUrl,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch user profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/profile
 * Create a new profile for the current user
 *
 * Request body:
 * {
 *   nickname?: string
 *   avatarUrl?: string
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

    // Get Keycloak user ID from session
    const keycloakId = (session.user as any).sub
    if (!keycloakId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      )
    }

    // Check if profile already exists
    const existingProfile = await getUserProfile(keycloakId)
    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 409 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { nickname, avatarUrl } = body

    // Validate nickname length if provided
    if (nickname && nickname.length > 100) {
      return NextResponse.json(
        { error: 'Nickname is too long (max 100 characters)' },
        { status: 400 }
      )
    }

    // Create user profile
    const profile = await createUserProfile({
      keycloakId,
      nickname,
      avatarUrl
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Profile created successfully',
        profile: {
          id: profile.id,
          keycloakId: profile.keycloakId,
          nickname: profile.nickname,
          avatarUrl: profile.avatarUrl,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user profile:', error)
    return NextResponse.json(
      {
        error: 'Failed to create user profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/profile
 * Update the current user's profile
 *
 * Request body:
 * {
 *   nickname?: string
 *   avatarUrl?: string
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get Keycloak user ID from session
    const keycloakId = (session.user as any).sub
    if (!keycloakId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { nickname, avatarUrl } = body

    // Validate that at least one field is provided
    if (nickname === undefined && avatarUrl === undefined) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Validate nickname length if provided
    if (nickname !== undefined && nickname !== null && nickname.length > 100) {
      return NextResponse.json(
        { error: 'Nickname is too long (max 100 characters)' },
        { status: 400 }
      )
    }

    // Check if profile exists
    const existingProfile = await getUserProfile(keycloakId)
    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found. Please create a profile first.' },
        { status: 404 }
      )
    }

    // Update user profile
    const profile = await updateUserProfile(keycloakId, {
      nickname,
      avatarUrl
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: profile.id,
        keycloakId: profile.keycloakId,
        nickname: profile.nickname,
        avatarUrl: profile.avatarUrl,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      {
        error: 'Failed to update user profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
