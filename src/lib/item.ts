import { prisma } from './prisma'
import type { Item, Prisma } from '@/generated/prisma/client'

/**
 * Item Service
 * Handles CRUD operations for game items
 */

/**
 * Get all featured and published items for homepage
 */
export async function listFeaturedItems(): Promise<Item[]> {
  return prisma.item.findMany({
    where: {
      published: true,
      featured: true,
    },
    orderBy: { order: 'asc' },
  })
}

/**
 * Get all published items
 */
export async function listPublishedItems(): Promise<Item[]> {
  return prisma.item.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  })
}

/**
 * Get all items (including unpublished) for admin interface
 */
export async function listAllItems(): Promise<Item[]> {
  return prisma.item.findMany({
    orderBy: { order: 'asc' },
  })
}

/**
 * Get an item by its ID
 */
export async function getItemById(id: number): Promise<Item | null> {
  return prisma.item.findUnique({
    where: { id },
  })
}

/**
 * Create a new item
 */
export async function createItem(data: Prisma.ItemCreateInput): Promise<Item> {
  return prisma.item.create({
    data,
  })
}

/**
 * Update an item by its ID
 */
export async function updateItem(
  id: number,
  data: Prisma.ItemUpdateInput
): Promise<Item> {
  return prisma.item.update({
    where: { id },
    data,
  })
}

/**
 * Delete an item by its ID
 */
export async function deleteItem(id: number): Promise<Item> {
  return prisma.item.delete({
    where: { id },
  })
}

/**
 * Check if an item exists
 */
export async function itemExists(id: number): Promise<boolean> {
  const count = await prisma.item.count({
    where: { id },
  })
  return count > 0
}
