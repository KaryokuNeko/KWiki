import { NextResponse } from 'next/server'
import { listPublishedVideos } from '@/lib/homepage-video'

/**
 * GET /api/homepage/videos
 * Public API - List all published homepage videos
 */
export async function GET() {
  try {
    const videos = await listPublishedVideos()
    return NextResponse.json({
      success: true,
      videos,
    })
  } catch (error) {
    console.error('Error fetching homepage videos:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch videos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
