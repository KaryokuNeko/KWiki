/**
 * Keycloak Admin API Client
 *
 * This client provides methods to interact with Keycloak Admin REST API
 * for user management operations (create, delete, list, etc.)
 *
 * @see https://www.keycloak.org/docs-api/latest/rest-api/index.html
 */

export interface KeycloakUser {
  id?: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  enabled?: boolean
  emailVerified?: boolean
  credentials?: Array<{
    type: string
    value: string
    temporary?: boolean
  }>
}

export interface KeycloakAdminConfig {
  baseUrl: string
  realm: string
  adminUsername: string
  adminPassword: string
  clientId?: string
  clientSecret?: string
}

export class KeycloakAdminClient {
  private config: KeycloakAdminConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(config: KeycloakAdminConfig) {
    this.config = {
      ...config,
      clientId: config.clientId || 'admin-cli',
    }
  }

  /**
   * Authenticate with Keycloak and obtain an access token
   */
  private async authenticate(): Promise<void> {
    const now = Date.now()

    // Check if token is still valid (with 30 second buffer)
    if (this.accessToken && this.tokenExpiry > now + 30000) {
      return
    }

    const tokenUrl = `${this.config.baseUrl}/realms/master/protocol/openid-connect/token`

    const params = new URLSearchParams()
    params.append('grant_type', 'password')
    params.append('client_id', this.config.clientId!)
    params.append('username', this.config.adminUsername)
    params.append('password', this.config.adminPassword)

    if (this.config.clientSecret) {
      params.append('client_secret', this.config.clientSecret)
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to authenticate with Keycloak: ${response.status} ${error}`)
    }

    const data = await response.json()
    this.accessToken = data.access_token
    // Set expiry time (expires_in is in seconds)
    this.tokenExpiry = now + (data.expires_in * 1000)
  }

  /**
   * Make an authenticated request to Keycloak Admin API
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.authenticate()

    const url = `${this.config.baseUrl}/admin/realms/${this.config.realm}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // For 204 No Content responses (like delete), return empty object
    if (response.status === 204) {
      return {} as T
    }

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Keycloak API error: ${response.status} ${error}`)
    }

    // For 201 Created responses, try to get the user ID from Location header
    if (response.status === 201) {
      const location = response.headers.get('Location')
      if (location) {
        const userId = location.split('/').pop()
        return { id: userId } as T
      }
      return {} as T
    }

    return response.json()
  }

  /**
   * Create a new user in Keycloak
   *
   * @param user User data
   * @returns The created user's ID
   */
  async createUser(user: KeycloakUser): Promise<string> {
    const userData = {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      enabled: user.enabled !== undefined ? user.enabled : true,
      emailVerified: user.emailVerified !== undefined ? user.emailVerified : false,
      credentials: user.credentials,
    }

    const result = await this.request<{ id?: string }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    // If we got an ID from the Location header, return it
    if (result.id) {
      return result.id
    }

    // Otherwise, we need to query for the user by username to get the ID
    const users = await this.getUsersByUsername(user.username)
    if (users.length === 0) {
      throw new Error('User created but could not retrieve user ID')
    }

    return users[0].id!
  }

  /**
   * Delete a user from Keycloak by user ID
   *
   * @param userId The Keycloak user ID
   */
  async deleteUser(userId: string): Promise<void> {
    await this.request(`/users/${userId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Get a user by ID
   *
   * @param userId The Keycloak user ID
   * @returns The user data
   */
  async getUserById(userId: string): Promise<KeycloakUser> {
    return this.request<KeycloakUser>(`/users/${userId}`)
  }

  /**
   * Get users by username (exact match)
   *
   * @param username The username to search for
   * @returns Array of matching users
   */
  async getUsersByUsername(username: string): Promise<KeycloakUser[]> {
    return this.request<KeycloakUser[]>(`/users?username=${encodeURIComponent(username)}&exact=true`)
  }

  /**
   * Get users by email (exact match)
   *
   * @param email The email to search for
   * @returns Array of matching users
   */
  async getUsersByEmail(email: string): Promise<KeycloakUser[]> {
    return this.request<KeycloakUser[]>(`/users?email=${encodeURIComponent(email)}&exact=true`)
  }

  /**
   * List all users in the realm
   *
   * @param first First result to return (pagination)
   * @param max Maximum number of results to return
   * @returns Array of users
   */
  async listUsers(first: number = 0, max: number = 100): Promise<KeycloakUser[]> {
    return this.request<KeycloakUser[]>(`/users?first=${first}&max=${max}`)
  }

  /**
   * Update a user's data
   *
   * @param userId The Keycloak user ID
   * @param updates User data to update
   */
  async updateUser(userId: string, updates: Partial<KeycloakUser>): Promise<void> {
    await this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  /**
   * Reset a user's password
   *
   * @param userId The Keycloak user ID
   * @param newPassword The new password
   * @param temporary Whether the password is temporary (user must change on next login)
   */
  async resetPassword(userId: string, newPassword: string, temporary: boolean = false): Promise<void> {
    await this.request(`/users/${userId}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({
        type: 'password',
        value: newPassword,
        temporary,
      }),
    })
  }

  /**
   * Enable or disable a user
   *
   * @param userId The Keycloak user ID
   * @param enabled Whether the user should be enabled
   */
  async setUserEnabled(userId: string, enabled: boolean): Promise<void> {
    await this.updateUser(userId, { enabled })
  }
}

/**
 * Create a Keycloak Admin Client instance with configuration from environment variables
 */
export function createKeycloakAdminClient(): KeycloakAdminClient {
  const baseUrl = process.env.KEYCLOAK_ADMIN_URL
  const realm = process.env.KEYCLOAK_REALM
  const adminUsername = process.env.KEYCLOAK_ADMIN
  const adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD

  if (!baseUrl || !realm || !adminUsername || !adminPassword) {
    throw new Error(
      'Missing required Keycloak Admin configuration. ' +
      'Please set KEYCLOAK_ADMIN_URL, KEYCLOAK_REALM, KEYCLOAK_ADMIN, and KEYCLOAK_ADMIN_PASSWORD environment variables.'
    )
  }

  return new KeycloakAdminClient({
    baseUrl,
    realm,
    adminUsername,
    adminPassword,
  })
}
