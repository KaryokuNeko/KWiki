/**
 * MinIO Client Configuration
 *
 * Provides a singleton MinIO client instance for object storage operations.
 * Configuration is loaded from environment variables.
 */

import * as Minio from 'minio'

// MinIO configuration from environment variables
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'minio.k-wiki.orb.local'
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000', 10)
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin'
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin123'
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true'
export const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'k-wiki'

// Validate required environment variables
if (!MINIO_ACCESS_KEY || !MINIO_SECRET_KEY) {
  throw new Error('MinIO credentials are not configured. Please check environment variables.')
}

/**
 * MinIO client singleton instance
 */
export const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
})

/**
 * Ensure the bucket exists and has the correct policy
 */
export async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(MINIO_BUCKET_NAME)
    if (!exists) {
      await minioClient.makeBucket(MINIO_BUCKET_NAME, 'us-east-1')
      console.log(`Created bucket: ${MINIO_BUCKET_NAME}`)
    }

    // Always ensure bucket policy is set correctly to allow public read access
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [
            `arn:aws:s3:::${MINIO_BUCKET_NAME}/avatars/*`,
            `arn:aws:s3:::${MINIO_BUCKET_NAME}/videos/*`,
            `arn:aws:s3:::${MINIO_BUCKET_NAME}/thumbnails/*`,
            `arn:aws:s3:::${MINIO_BUCKET_NAME}/characters/*`,
            `arn:aws:s3:::${MINIO_BUCKET_NAME}/items/*`,
            `arn:aws:s3:::${MINIO_BUCKET_NAME}/skills/*`,
          ],
        },
      ],
    }
    await minioClient.setBucketPolicy(MINIO_BUCKET_NAME, JSON.stringify(policy))
    console.log('Bucket policy set for public access')
  } catch (error) {
    console.error('Error ensuring bucket exists:', error)
    throw error
  }
}

/**
 * Upload a file to MinIO
 *
 * @param buffer - File buffer to upload
 * @param fileName - Name of the file
 * @param contentType - MIME type of the file
 * @param folder - Optional folder prefix (default: 'avatars')
 * @returns Object URL of the uploaded file
 */
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'avatars'
): Promise<string> {
  try {
    await ensureBucket()

    const objectName = `${folder}/${Date.now()}-${fileName}`
    const metadata = {
      'Content-Type': contentType,
    }

    await minioClient.putObject(MINIO_BUCKET_NAME, objectName, buffer, buffer.length, metadata)

    const baseUrl = process.env.MINIO_PUBLIC_URL
    const url = `${baseUrl}/${MINIO_BUCKET_NAME}/${objectName}`

    return url
  } catch (error) {
    console.error('Error uploading file to MinIO:', error)
    throw error
  }
}

/**
 * Delete a file from MinIO
 *
 * @param fileUrl - Full URL of the file to delete
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Extract object name from URL
    const urlPattern = new RegExp(`^https?://.+/${MINIO_BUCKET_NAME}/(.+)$`)
    const match = fileUrl.match(urlPattern)

    if (!match) {
      throw new Error('Invalid MinIO file URL')
    }

    const objectName = match[1]
    await minioClient.removeObject(MINIO_BUCKET_NAME, objectName)
  } catch (error) {
    console.error('Error deleting file from MinIO:', error)
    throw error
  }
}

/**
 * Get a presigned URL for temporary file access
 *
 * @param objectName - Name of the object in the bucket
 * @param expirySeconds - Expiry time in seconds (default: 7 days)
 * @returns Presigned URL
 */
export async function getPresignedUrl(
  objectName: string,
  expirySeconds: number = 7 * 24 * 60 * 60
): Promise<string> {
  try {
    return await minioClient.presignedGetObject(MINIO_BUCKET_NAME, objectName, expirySeconds)
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    throw error
  }
}
