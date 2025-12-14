import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { uploadFile } from '@/lib/minio'

/**
 * POST /api/upload/image?folder=characters|items|skills|thumbnails
 * Upload an image file to MinIO
 *
 * Accepts multipart/form-data with a file field named "image"
 * Query parameter "folder" specifies the MinIO folder (defaults to "images")
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

    // Get folder from query parameter
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'images'

    // Validate folder name
    const allowedFolders = ['characters', 'items', 'skills', 'thumbnails', 'images']
    if (!allowedFolders.includes(folder)) {
      return NextResponse.json(
        {
          error: `Invalid folder. Allowed folders: ${allowedFolders.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
        },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
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
      folder
    )

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      url: fileUrl,
      folder,
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
