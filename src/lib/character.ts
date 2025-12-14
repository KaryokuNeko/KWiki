import { prisma } from './prisma'
import type { Character, CharacterSkill, Prisma } from '@/generated/prisma/client'

/**
 * Character Service
 * Handles CRUD operations for game characters and their skills
 */

/**
 * Get all featured and published characters with their skills for homepage
 */
export async function listFeaturedCharacters(): Promise<
  (Character & { skills: CharacterSkill[] })[]
> {
  return prisma.character.findMany({
    where: {
      published: true,
      featured: true,
    },
    include: {
      skills: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })
}

/**
 * Get all characters (including unpublished) for admin interface
 */
export async function listAllCharacters(): Promise<
  (Character & { skills: CharacterSkill[] })[]
> {
  return prisma.character.findMany({
    include: {
      skills: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })
}

/**
 * Get a character by its ID with skills
 */
export async function getCharacterById(
  id: number
): Promise<(Character & { skills: CharacterSkill[] }) | null> {
  return prisma.character.findUnique({
    where: { id },
    include: { skills: { orderBy: { order: 'asc' } } },
  })
}

/**
 * Create a new character
 */
export async function createCharacter(
  data: Prisma.CharacterCreateInput
): Promise<Character> {
  return prisma.character.create({
    data,
  })
}

/**
 * Update a character by its ID
 */
export async function updateCharacter(
  id: number,
  data: Prisma.CharacterUpdateInput
): Promise<Character> {
  return prisma.character.update({
    where: { id },
    data,
  })
}

/**
 * Delete a character by its ID (cascades to skills)
 */
export async function deleteCharacter(id: number): Promise<Character> {
  return prisma.character.delete({
    where: { id },
  })
}

/**
 * Check if a character exists
 */
export async function characterExists(id: number): Promise<boolean> {
  const count = await prisma.character.count({
    where: { id },
  })
  return count > 0
}

// ============================================================================
// Character Skills
// ============================================================================

/**
 * Create a skill for a character
 */
export async function createSkill(
  data: Prisma.CharacterSkillCreateInput
): Promise<CharacterSkill> {
  return prisma.characterSkill.create({
    data,
  })
}

/**
 * Update a skill by its ID
 */
export async function updateSkill(
  id: number,
  data: Prisma.CharacterSkillUpdateInput
): Promise<CharacterSkill> {
  return prisma.characterSkill.update({
    where: { id },
    data,
  })
}

/**
 * Delete a skill by its ID
 */
export async function deleteSkill(id: number): Promise<CharacterSkill> {
  return prisma.characterSkill.delete({
    where: { id },
  })
}

/**
 * Get all skills for a character
 */
export async function getSkillsByCharacterId(
  characterId: number
): Promise<CharacterSkill[]> {
  return prisma.characterSkill.findMany({
    where: { characterId },
    orderBy: { order: 'asc' },
  })
}

/**
 * Count skills for a character
 */
export async function countSkillsForCharacter(
  characterId: number
): Promise<number> {
  return prisma.characterSkill.count({
    where: { characterId },
  })
}

/**
 * Get a skill by its ID
 */
export async function getSkillById(id: number): Promise<CharacterSkill | null> {
  return prisma.characterSkill.findUnique({
    where: { id },
  })
}
