import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getCharacterById, updateCharacter, deleteCharacter } from '@/lib/character'

/**
 * GET /api/admin/content/characters/[id]
 * Get a single character by ID with skills
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const characterId = parseInt(id, 10)
    if (isNaN(characterId)) {
      return NextResponse.json(
        { error: 'Invalid character ID' },
        { status: 400 }
      )
    }

    const character = await getCharacterById(characterId)
    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      character,
    })
  } catch (error) {
    console.error('Error fetching character:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch character',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/content/characters/[id]
 * Update a character by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const characterId = parseInt(id, 10)
    if (isNaN(characterId)) {
      return NextResponse.json(
        { error: 'Invalid character ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      nameEn,
      nameZh,
      descEn,
      descZh,
      imageUrl,
      order,
      featured,
      published,
    } = body

    // Build update data object (only include provided fields)
    const updateData: Record<string, unknown> = {}
    if (nameEn !== undefined) updateData.nameEn = nameEn
    if (nameZh !== undefined) updateData.nameZh = nameZh
    if (descEn !== undefined) updateData.descEn = descEn
    if (descZh !== undefined) updateData.descZh = descZh
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (order !== undefined) updateData.order = order
    if (featured !== undefined) updateData.featured = featured
    if (published !== undefined) updateData.published = published

    const character = await updateCharacter(characterId, updateData)

    return NextResponse.json({
      success: true,
      message: 'Character updated successfully',
      character,
    })
  } catch (error) {
    console.error('Error updating character:', error)
    return NextResponse.json(
      {
        error: 'Failed to update character',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/content/characters/[id]
 * Delete a character by ID (cascades to skills)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const characterId = parseInt(id, 10)
    if (isNaN(characterId)) {
      return NextResponse.json(
        { error: 'Invalid character ID' },
        { status: 400 }
      )
    }

    await deleteCharacter(characterId)

    return NextResponse.json({
      success: true,
      message: 'Character deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting character:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete character',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
