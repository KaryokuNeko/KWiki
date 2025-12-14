"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { PlusIcon, XCircleIcon } from "@heroicons/react/24/outline"
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
  const t = useTranslations('users')
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
        throw new Error(t('messages.fetchFailed'))
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.unknownError'))
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
        throw new Error(error.error || t('messages.createFailed'))
      }

      await fetchUsers()
      setIsCreateDialogOpen(false)
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : t('messages.unknownError'),
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
        throw new Error(error.error || t('messages.updateFailed'))
      }

      await fetchUsers()
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : t('messages.unknownError'),
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
        throw new Error(error.error || t('messages.deleteFailed'))
      }

      await fetchUsers()
      setUserToDelete(null)
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : t('messages.unknownError'),
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
        throw new Error(error.error || t('messages.resetPasswordFailed'))
      }

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : t('messages.unknownError'),
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">{t('title')}</h2>
          <p className="mt-2 text-base-content/60">
            {t('description')}
          </p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="btn btn-primary gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {t('createUser')}
        </button>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          <XCircleIcon className="h-6 w-6 shrink-0 stroke-current" />
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
