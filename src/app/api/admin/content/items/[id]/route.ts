import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getItemById, updateItem, deleteItem } from '@/lib/item'

/**
 * GET /api/admin/content/items/[id]
 * Get a single item by ID
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
    const itemId = parseInt(id, 10)
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }

    const item = await getItemById(itemId)
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      item,
    })
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/content/items/[id]
 * Update an item by ID
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
    const itemId = parseInt(id, 10)
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
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
      rarity,
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
    if (rarity !== undefined) updateData.rarity = rarity
    if (order !== undefined) updateData.order = order
    if (featured !== undefined) updateData.featured = featured
    if (published !== undefined) updateData.published = published

    const item = await updateItem(itemId, updateData)

    return NextResponse.json({
      success: true,
      message: 'Item updated successfully',
      item,
    })
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      {
        error: 'Failed to update item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/content/items/[id]
 * Delete an item by ID
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
    const itemId = parseInt(id, 10)
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }

    await deleteItem(itemId)

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
