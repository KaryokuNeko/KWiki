"use client"

import { useState } from "react"
import { User } from "./UserManagement"

interface DeleteUserDialogProps {
  isOpen: boolean
  user: User
  onClose: () => void
  onConfirm: (userId: string) => Promise<{ success: boolean; error?: string }>
}

export function DeleteUserDialog({ isOpen, user, onClose, onConfirm }: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)

    const result = await onConfirm(user.id)

    setLoading(false)

    if (result.success) {
      onClose()
    } else {
      setError(result.error || "Failed to delete user")
    }
  }

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg flex items-center gap-2 text-error">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Delete User
        </h3>

        <div className="py-4">
          <p className="text-base-content/80 mb-4">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>

          <div className="card bg-base-200">
            <div className="card-body py-3 px-4">
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs font-medium text-base-content/60">Username</dt>
                  <dd className="text-sm font-semibold">{user.username}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-base-content/60">Email</dt>
                  <dd className="text-sm">{user.email}</dd>
                </div>
                {(user.firstName || user.lastName) && (
                  <div>
                    <dt className="text-xs font-medium text-base-content/60">Name</dt>
                    <dd className="text-sm">
                      {`${user.firstName || ""} ${user.lastName || ""}`.trim()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {error && (
            <div role="alert" className="alert alert-error mt-4">
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
        </div>

        <div className="modal-action">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="btn btn-error"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>
                Deleting...
              </>
            ) : (
              "Delete User"
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}
