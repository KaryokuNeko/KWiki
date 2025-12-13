/**
 * User Profile Database Client
 *
 * Provides database operations for user profiles including:
 * - Creating, reading, updating user profiles
 * - Managing nickname and avatar
 */

import { prisma } from './prisma'
import { UserProfile } from '@/generated/prisma/client'

export interface CreateUserProfileInput {
  keycloakId: string
  nickname?: string
  avatarUrl?: string
}

export interface UpdateUserProfileInput {
  nickname?: string
  avatarUrl?: string
}

/**
 * Get user profile by Keycloak ID
 *
 * @param keycloakId Keycloak user ID
 * @returns User profile or null if not found
 */
export async function getUserProfile(keycloakId: string): Promise<UserProfile | null> {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { keycloakId }
    })
    return profile
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw new Error('Failed to fetch user profile')
  }
}

/**
 * Create a new user profile
 *
 * @param data User profile data
 * @returns Created user profile
 */
export async function createUserProfile(data: CreateUserProfileInput): Promise<UserProfile> {
  try {
    const profile = await prisma.userProfile.create({
      data: {
        keycloakId: data.keycloakId,
        nickname: data.nickname,
        avatarUrl: data.avatarUrl
      }
    })
    return profile
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw new Error('Failed to create user profile')
  }
}

/**
 * Update an existing user profile
 *
 * @param keycloakId Keycloak user ID
 * @param data Fields to update
 * @returns Updated user profile
 */
export async function updateUserProfile(
  keycloakId: string,
  data: UpdateUserProfileInput
): Promise<UserProfile> {
  try {
    const profile = await prisma.userProfile.update({
      where: { keycloakId },
      data: {
        nickname: data.nickname,
        avatarUrl: data.avatarUrl
      }
    })
    return profile
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw new Error('Failed to update user profile')
  }
}

/**
 * Get or create user profile
 * Returns existing profile or creates a new one if it doesn't exist
 *
 * @param keycloakId Keycloak user ID
 * @param defaultData Default data to use if creating a new profile
 * @returns User profile
 */
export async function getOrCreateUserProfile(
  keycloakId: string,
  defaultData?: Partial<CreateUserProfileInput>
): Promise<UserProfile> {
  try {
    let profile = await getUserProfile(keycloakId)

    if (!profile) {
      profile = await createUserProfile({
        keycloakId,
        nickname: defaultData?.nickname,
        avatarUrl: defaultData?.avatarUrl
      })
    }

    return profile
  } catch (error) {
    console.error('Error getting or creating user profile:', error)
    throw new Error('Failed to get or create user profile')
  }
}

/**
 * Delete a user profile
 *
 * @param keycloakId Keycloak user ID
 */
export async function deleteUserProfile(keycloakId: string): Promise<void> {
  try {
    await prisma.userProfile.delete({
      where: { keycloakId }
    })
  } catch (error) {
    console.error('Error deleting user profile:', error)
    throw new Error('Failed to delete user profile')
  }
}

/**
 * Check if a user profile exists
 *
 * @param keycloakId Keycloak user ID
 * @returns True if profile exists, false otherwise
 */
export async function userProfileExists(keycloakId: string): Promise<boolean> {
  try {
    const count = await prisma.userProfile.count({
      where: { keycloakId }
    })
    return count > 0
  } catch (error) {
    console.error('Error checking user profile existence:', error)
    throw new Error('Failed to check user profile existence')
  }
}
