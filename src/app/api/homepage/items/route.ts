import { NextResponse } from 'next/server'
import { listFeaturedItems } from '@/lib/item'

/**
 * GET /api/homepage/items
 * Public API - List all featured and published items
 */
export async function GET() {
  try {
    const items = await listFeaturedItems()
    return NextResponse.json({
      success: true,
      items,
    })
  } catch (error) {
    console.error('Error fetching homepage items:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch items',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
