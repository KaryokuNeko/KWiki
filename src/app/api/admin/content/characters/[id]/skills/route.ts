import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createSkill, countSkillsForCharacter, characterExists } from '@/lib/character'

/**
 * POST /api/admin/content/characters/[id]/skills
 * Add a skill to a character
 */
export async function POST(
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

    // Check if character exists
    const exists = await characterExists(characterId)
    if (!exists) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    // Check skill count (max 4)
    const skillCount = await countSkillsForCharacter(characterId)
    if (skillCount >= 4) {
      return NextResponse.json(
        { error: 'Character already has maximum 4 skills' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      nameEn,
      nameZh,
      descEn,
      descZh,
      iconUrl,
      order = skillCount + 1,
    } = body

    // Validation
    if (!nameEn || !nameZh || !descEn || !descZh || !iconUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: nameEn, nameZh, descEn, descZh, iconUrl' },
        { status: 400 }
      )
    }

    const skill = await createSkill({
      nameEn,
      nameZh,
      descEn,
      descZh,
      iconUrl,
      order,
      character: {
        connect: { id: characterId },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Skill created successfully',
      skill,
    })
  } catch (error) {
    console.error('Error creating skill:', error)
    return NextResponse.json(
      {
        error: 'Failed to create skill',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
