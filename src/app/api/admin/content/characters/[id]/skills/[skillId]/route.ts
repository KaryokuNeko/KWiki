import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getSkillById, updateSkill, deleteSkill } from '@/lib/character'

/**
 * PUT /api/admin/content/characters/[id]/skills/[skillId]
 * Update a skill by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; skillId: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { skillId: skillIdStr } = await params
    const skillId = parseInt(skillIdStr, 10)
    if (isNaN(skillId)) {
      return NextResponse.json(
        { error: 'Invalid skill ID' },
        { status: 400 }
      )
    }

    // Check if skill exists
    const existingSkill = await getSkillById(skillId)
    if (!existingSkill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      nameEn,
      nameZh,
      descEn,
      descZh,
      iconUrl,
      order,
    } = body

    // Build update data object (only include provided fields)
    const updateData: Record<string, unknown> = {}
    if (nameEn !== undefined) updateData.nameEn = nameEn
    if (nameZh !== undefined) updateData.nameZh = nameZh
    if (descEn !== undefined) updateData.descEn = descEn
    if (descZh !== undefined) updateData.descZh = descZh
    if (iconUrl !== undefined) updateData.iconUrl = iconUrl
    if (order !== undefined) updateData.order = order

    const skill = await updateSkill(skillId, updateData)

    return NextResponse.json({
      success: true,
      message: 'Skill updated successfully',
      skill,
    })
  } catch (error) {
    console.error('Error updating skill:', error)
    return NextResponse.json(
      {
        error: 'Failed to update skill',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/content/characters/[id]/skills/[skillId]
 * Delete a skill by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; skillId: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { skillId: skillIdStr } = await params
    const skillId = parseInt(skillIdStr, 10)
    if (isNaN(skillId)) {
      return NextResponse.json(
        { error: 'Invalid skill ID' },
        { status: 400 }
      )
    }

    await deleteSkill(skillId)

    return NextResponse.json({
      success: true,
      message: 'Skill deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting skill:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete skill',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
