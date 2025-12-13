"use client"

import { useState, useEffect } from "react"
import { UserList } from "./UserList"
import { CreateUserDialog } from "./CreateUserDialog"
import { EditUserDialog } from "./EditUserDialog"
import { DeleteUserDialog } from "./DeleteUserDialog"

export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  enabled?: boolean
  emailVerified?: boolean
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/admin/users")

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async (userData: {
    username: string
    email: string
    firstName?: string
    lastName?: string
    password?: string
    enabled?: boolean
    emailVerified?: boolean
    temporary?: boolean
  }) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create user")
      }

      await fetchUsers()
      setIsCreateDialogOpen(false)
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }
    }
  }

  const handleEditUser = async (
    userId: string,
    updates: {
      email?: string
      firstName?: string
      lastName?: string
      enabled?: boolean
      emailVerified?: boolean
    }
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update user")
      }

      await fetchUsers()
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete user")
      }

      await fetchUsers()
      setUserToDelete(null)
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }
    }
  }

  const handleResetPassword = async (userId: string, password: string, temporary: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, temporary }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to reset password")
      }

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="mt-2 text-base-content/60">
            Manage Keycloak users, create new accounts, and update user information.
          </p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="btn btn-primary gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Create User
        </button>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          <svg
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <UserList
        users={users}
        loading={loading}
        onEdit={(user) => {
          setSelectedUser(user)
          setIsEditDialogOpen(true)
        }}
        onDelete={(user) => setUserToDelete(user)}
        onResetPassword={handleResetPassword}
        onRefresh={fetchUsers}
      />

      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateUser}
      />

      {selectedUser && (
        <EditUserDialog
          isOpen={isEditDialogOpen}
          user={selectedUser}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedUser(null)
          }}
          onSubmit={handleEditUser}
        />
      )}

      {userToDelete && (
        <DeleteUserDialog
          isOpen={true}
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  )
}
