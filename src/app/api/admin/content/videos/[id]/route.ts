import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getVideoById, updateVideo, deleteVideo } from '@/lib/homepage-video'

/**
 * GET /api/admin/content/videos/[id]
 * Get a single video by ID
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
    const videoId = parseInt(id, 10)
    if (isNaN(videoId)) {
      return NextResponse.json(
        { error: 'Invalid video ID' },
        { status: 400 }
      )
    }

    const video = await getVideoById(videoId)
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      video,
    })
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch video',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/content/videos/[id]
 * Update a video by ID
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
    const videoId = parseInt(id, 10)
    if (isNaN(videoId)) {
      return NextResponse.json(
        { error: 'Invalid video ID' },
        { status: 400 }
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
      autoplay,
      order,
      published,
    } = body

    // Build update data object (only include provided fields)
    const updateData: Record<string, unknown> = {}
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl
    if (titleEn !== undefined) updateData.titleEn = titleEn
    if (titleZh !== undefined) updateData.titleZh = titleZh
    if (descEn !== undefined) updateData.descEn = descEn
    if (descZh !== undefined) updateData.descZh = descZh
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl
    if (autoplay !== undefined) updateData.autoplay = autoplay
    if (order !== undefined) updateData.order = order
    if (published !== undefined) updateData.published = published

    const video = await updateVideo(videoId, updateData)

    return NextResponse.json({
      success: true,
      message: 'Video updated successfully',
      video,
    })
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      {
        error: 'Failed to update video',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/content/videos/[id]
 * Delete a video by ID
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
    const videoId = parseInt(id, 10)
    if (isNaN(videoId)) {
      return NextResponse.json(
        { error: 'Invalid video ID' },
        { status: 400 }
      )
    }

    await deleteVideo(videoId)

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete video',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
