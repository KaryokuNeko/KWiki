import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { listAllVideos, createVideo } from '@/lib/homepage-video'

/**
 * GET /api/admin/content/videos
 * List all homepage videos (including unpublished)
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

    const videos = await listAllVideos()
    return NextResponse.json({
      success: true,
      videos,
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch videos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/content/videos
 * Create a new homepage video
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
      videoUrl,
      titleEn,
      titleZh,
      descEn,
      descZh,
      thumbnailUrl,
      autoplay = true,
      order = 0,
      published = false,
    } = body

    // Validation
    if (!videoUrl || !titleEn || !titleZh) {
      return NextResponse.json(
        { error: 'Missing required fields: videoUrl, titleEn, titleZh' },
        { status: 400 }
      )
    }

    const video = await createVideo({
      videoUrl,
      titleEn,
      titleZh,
      descEn: descEn || null,
      descZh: descZh || null,
      thumbnailUrl: thumbnailUrl || null,
      autoplay,
      order,
      published,
    })

    return NextResponse.json({
      success: true,
      message: 'Video created successfully',
      video,
    })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      {
        error: 'Failed to create video',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
