import { prisma } from './prisma'
import type { HomepageVideo, Prisma } from '@/generated/prisma/client'

/**
 * Homepage Video Service
 * Handles CRUD operations for homepage video carousel
 */

/**
 * Get all published videos ordered by their order field
 */
export async function listPublishedVideos(): Promise<HomepageVideo[]> {
  return prisma.homepageVideo.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  })
}

/**
 * Get all videos (including unpublished) for admin interface
 */
export async function listAllVideos(): Promise<HomepageVideo[]> {
  return prisma.homepageVideo.findMany({
    orderBy: { order: 'asc' },
  })
}

/**
 * Get a video by its ID
 */
export async function getVideoById(id: number): Promise<HomepageVideo | null> {
  return prisma.homepageVideo.findUnique({
    where: { id },
  })
}

/**
 * Create a new video
 */
export async function createVideo(
  data: Prisma.HomepageVideoCreateInput
): Promise<HomepageVideo> {
  return prisma.homepageVideo.create({
    data,
  })
}

/**
 * Update a video by its ID
 */
export async function updateVideo(
  id: number,
  data: Prisma.HomepageVideoUpdateInput
): Promise<HomepageVideo> {
  return prisma.homepageVideo.update({
    where: { id },
    data,
  })
}

/**
 * Delete a video by its ID
 */
export async function deleteVideo(id: number): Promise<HomepageVideo> {
  return prisma.homepageVideo.delete({
    where: { id },
  })
}

/**
 * Check if a video exists
 */
export async function videoExists(id: number): Promise<boolean> {
  const count = await prisma.homepageVideo.count({
    where: { id },
  })
  return count > 0
}
