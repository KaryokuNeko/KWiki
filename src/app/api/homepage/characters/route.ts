import { NextResponse } from 'next/server'
import { listFeaturedCharacters } from '@/lib/character'

/**
 * GET /api/homepage/characters
 * Public API - List all featured and published characters with skills
 */
export async function GET() {
  try {
    const characters = await listFeaturedCharacters()
    return NextResponse.json({
      success: true,
      characters,
    })
  } catch (error) {
    console.error('Error fetching homepage characters:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch characters',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
