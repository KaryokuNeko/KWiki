"use client"

import { useState } from "react"
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
          <svg
            className="w-16 h-16 text-base-content/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
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
                        <svg
                          className="w-5 h-5 text-success"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="tooltip" data-tip="Email not verified">
                        <svg
                          className="w-5 h-5 text-base-content/30"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
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
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setResetPasswordUser(user)}
                        className="btn btn-ghost btn-xs text-warning"
                        title="Reset password"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(user)}
                        className="btn btn-ghost btn-xs text-error"
                        title="Delete user"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
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
