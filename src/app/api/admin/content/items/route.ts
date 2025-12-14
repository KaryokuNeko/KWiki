import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { listAllItems, createItem } from '@/lib/item'

/**
 * GET /api/admin/content/items
 * List all items (including unpublished)
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

    const items = await listAllItems()
    return NextResponse.json({
      success: true,
      items,
    })
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch items',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/content/items
 * Create a new item
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
      rarity,
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

    const item = await createItem({
      nameEn,
      nameZh,
      descEn,
      descZh,
      imageUrl,
      rarity: rarity || null,
      order,
      featured,
      published,
    })

    return NextResponse.json({
      success: true,
      message: 'Item created successfully',
      item,
    })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      {
        error: 'Failed to create item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
