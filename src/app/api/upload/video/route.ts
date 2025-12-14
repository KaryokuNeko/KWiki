import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { uploadFile } from '@/lib/minio'

/**
 * POST /api/upload/video
 * Upload a video file to MinIO
 *
 * Accepts multipart/form-data with a file field named "video"
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('video') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (only MP4)
    const allowedTypes = ['video/mp4']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only MP4 videos are allowed.',
        },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to MinIO
    const fileUrl = await uploadFile(
      buffer,
      file.name,
      file.type,
      'videos'
    )

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      url: fileUrl,
    })
  } catch (error) {
    console.error('Error uploading video:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload video',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
