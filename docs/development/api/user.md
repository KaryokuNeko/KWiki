# Keycloak User Management API

This document describes the REST API endpoints for managing users in Keycloak.

## Authentication

All API endpoints require authentication. The user must be logged in with NextAuth.js and have a valid session.

## Base URL

All endpoints are relative to: `/api/admin/users`

## Endpoints

### 1. List Users

**Endpoint:** `GET /api/admin/users`

**Description:** List all users in the realm with pagination support.

**Query Parameters:**
- `first` (optional): First result to return (default: 0)
- `max` (optional): Maximum number of results (default: 100)

**Example Request:**
```bash
curl -X GET 'http://localhost:3000/api/admin/users?first=0&max=10' \
  -H 'Cookie: your-session-cookie'
```

**Example Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "12345-67890-abcdef",
      "username": "john.doe",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "enabled": true,
      "emailVerified": true
    }
  ],
  "pagination": {
    "first": 0,
    "max": 10,
    "count": 1
  }
}
```

---

### 2. Create User

**Endpoint:** `POST /api/admin/users`

**Description:** Create a new user in Keycloak.

**Request Body:**
```json
{
  "username": "john.doe",           // Required
  "email": "john.doe@example.com",  // Required
  "firstName": "John",               // Optional
  "lastName": "Doe",                 // Optional
  "password": "SecurePass123",       // Optional
  "enabled": true,                   // Optional (default: true)
  "emailVerified": false,            // Optional (default: false)
  "temporary": false                 // Optional (default: false) - if true, user must change password on first login
}
```

**Example Request:**
```bash
curl -X POST 'http://localhost:3000/api/admin/users' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: your-session-cookie' \
  -d '{
    "username": "john.doe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePass123",
    "enabled": true,
    "emailVerified": false,
    "temporary": false
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "12345-67890-abcdef",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "enabled": true,
    "emailVerified": false
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or invalid email format
- `409 Conflict` - User with username or email already exists
- `500 Internal Server Error` - Failed to create user

---

### 3. Get User by ID

**Endpoint:** `GET /api/admin/users/[userId]`

**Description:** Get a specific user by their Keycloak user ID.

**Example Request:**
```bash
curl -X GET 'http://localhost:3000/api/admin/users/12345-67890-abcdef' \
  -H 'Cookie: your-session-cookie'
```

**Example Response:**
```json
{
  "success": true,
  "user": {
    "id": "12345-67890-abcdef",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "enabled": true,
    "emailVerified": true
  }
}
```

**Error Responses:**
- `404 Not Found` - User not found

---

### 4. Update User

**Endpoint:** `PUT /api/admin/users/[userId]`

**Description:** Update a user's information.

**Request Body:**
```json
{
  "email": "new.email@example.com",  // Optional
  "firstName": "Jane",                // Optional
  "lastName": "Smith",                // Optional
  "enabled": false,                   // Optional
  "emailVerified": true               // Optional
}
```

**Note:** Username cannot be changed. Only provide fields you want to update.

**Example Request:**
```bash
curl -X PUT 'http://localhost:3000/api/admin/users/12345-67890-abcdef' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: your-session-cookie' \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "12345-67890-abcdef",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "enabled": true,
    "emailVerified": true
  }
}
```

**Error Responses:**
- `400 Bad Request` - No fields to update or invalid email format
- `404 Not Found` - User not found

---

### 5. Delete User

**Endpoint:** `DELETE /api/admin/users/[userId]`

**Description:** Delete a user from Keycloak.

**Example Request:**
```bash
curl -X DELETE 'http://localhost:3000/api/admin/users/12345-67890-abcdef' \
  -H 'Cookie: your-session-cookie'
```

**Example Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "userId": "12345-67890-abcdef"
}
```

**Error Responses:**
- `404 Not Found` - User not found

---

### 6. Reset Password

**Endpoint:** `POST /api/admin/users/[userId]/reset-password`

**Description:** Reset a user's password.

**Request Body:**
```json
{
  "password": "NewSecurePass123",  // Required (minimum 8 characters)
  "temporary": false                // Optional (default: false) - if true, user must change password on next login
}
```

**Example Request:**
```bash
curl -X POST 'http://localhost:3000/api/admin/users/12345-67890-abcdef/reset-password' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: your-session-cookie' \
  -d '{
    "password": "NewSecurePass123",
    "temporary": false
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "userId": "12345-67890-abcdef",
  "temporary": false
}
```

**Error Responses:**
- `400 Bad Request` - Missing password or password too short
- `404 Not Found` - User not found

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - User created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - User not found
- `409 Conflict` - User already exists
- `500 Internal Server Error` - Server error

## Environment Configuration

Before using these APIs, ensure the following environment variables are set:

```bash
# Keycloak Admin API Configuration
KEYCLOAK_ADMIN_URL=http://keycloak:8080  # or https://keycloak.k-wiki.orb.local for OrbStack
KEYCLOAK_REALM=k-wiki
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin123
```

See the environment template files (`.env.orbstack-dev.example`, `.env.docker-dev.example`, `.env.standard.example`) for complete configuration examples.

## Security Considerations

1. **Authentication Required**: All endpoints require a valid NextAuth session
2. **Admin Privileges**: In production, consider adding role-based access control (RBAC) to restrict these endpoints to admin users only
3. **Password Policy**: The current implementation requires passwords to be at least 8 characters. Consider implementing stricter password policies in production
4. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
5. **Audit Logging**: Consider logging all user management operations for security auditing

## Using the Keycloak Admin Client Directly

The `KeycloakAdminClient` class can also be used directly in your server-side code:

```typescript
import { createKeycloakAdminClient } from '@/lib/keycloak-admin'

// Create client
const keycloakAdmin = createKeycloakAdminClient()

// Create a user
const userId = await keycloakAdmin.createUser({
  username: 'john.doe',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  enabled: true,
  credentials: [{
    type: 'password',
    value: 'SecurePass123',
    temporary: false
  }]
})

// Get user by ID
const user = await keycloakAdmin.getUserById(userId)

// Update user
await keycloakAdmin.updateUser(userId, {
  firstName: 'Jane',
  lastName: 'Smith'
})

// Reset password
await keycloakAdmin.resetPassword(userId, 'NewPassword123', false)

// Delete user
await keycloakAdmin.deleteUser(userId)
```

## Additional Methods

The `KeycloakAdminClient` class provides additional methods not exposed via API endpoints:

- `getUsersByUsername(username)` - Find users by username (exact match)
- `getUsersByEmail(email)` - Find users by email (exact match)
- `setUserEnabled(userId, enabled)` - Enable or disable a user
- `listUsers(first, max)` - List users with pagination

See [src/lib/keycloak-admin.ts](../src/lib/keycloak-admin.ts) for the complete API reference.
