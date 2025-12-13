"use client"

import { useState } from "react"
import {
  UserGroupIcon,
  PencilSquareIcon,
  KeyIcon,
  TrashIcon
} from "@heroicons/react/24/outline"
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid
} from "@heroicons/react/24/solid"
import { User } from "./UserManagement"
import { ResetPasswordDialog } from "./ResetPasswordDialog"

interface UserListProps {
  users: User[]
  loading: boolean
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onResetPassword: (userId: string, password: string, temporary: boolean) => Promise<{ success: boolean; error?: string }>
  onRefresh: () => void
}

export function UserList({
  users,
  loading,
  onEdit,
  onDelete,
  onResetPassword,
  onRefresh,
}: UserListProps) {
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <UserGroupIcon className="w-16 h-16 text-base-content/30" />
          <h3 className="card-title">No users found</h3>
          <p className="text-base-content/60">
            Get started by creating a new user.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Name</th>
                <th>Status</th>
                <th>Email Verified</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover">
                  <td>
                    <div className="font-medium">{user.username}</div>
                  </td>
                  <td>
                    <div className="text-sm opacity-70">{user.email}</div>
                  </td>
                  <td>
                    {user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : "-"}
                  </td>
                  <td>
                    {user.enabled ? (
                      <span className="badge badge-success badge-sm">Active</span>
                    ) : (
                      <span className="badge badge-error badge-sm">Disabled</span>
                    )}
                  </td>
                  <td>
                    {user.emailVerified ? (
                      <div className="tooltip" data-tip="Email verified">
                        <CheckCircleIconSolid className="w-5 h-5 text-success" />
                      </div>
                    ) : (
                      <div className="tooltip" data-tip="Email not verified">
                        <XCircleIconSolid className="w-5 h-5 text-base-content/30" />
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="btn btn-ghost btn-xs"
                        title="Edit user"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setResetPasswordUser(user)}
                        className="btn btn-ghost btn-xs text-warning"
                        title="Reset password"
                      >
                        <KeyIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(user)}
                        className="btn btn-ghost btn-xs text-error"
                        title="Delete user"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {resetPasswordUser && (
        <ResetPasswordDialog
          isOpen={true}
          user={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
          onSubmit={onResetPassword}
        />
      )}
    </>
  )
}
