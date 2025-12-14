import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { listAllCharacters, createCharacter } from '@/lib/character'

/**
 * GET /api/admin/content/characters
 * List all characters (including unpublished)
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const characters = await listAllCharacters()
    return NextResponse.json({
      success: true,
      characters,
    })
  } catch (error) {
    console.error('Error fetching characters:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch characters',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/content/characters
 * Create a new character
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      nameEn,
      nameZh,
      descEn,
      descZh,
      imageUrl,
      order = 0,
      featured = false,
      published = false,
    } = body

    // Validation
    if (!nameEn || !nameZh || !descEn || !descZh || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: nameEn, nameZh, descEn, descZh, imageUrl' },
        { status: 400 }
      )
    }

    const character = await createCharacter({
      nameEn,
      nameZh,
      descEn,
      descZh,
      imageUrl,
      order,
      featured,
      published,
    })

    return NextResponse.json({
      success: true,
      message: 'Character created successfully',
      character,
    })
  } catch (error) {
    console.error('Error creating character:', error)
    return NextResponse.json(
      {
        error: 'Failed to create character',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
