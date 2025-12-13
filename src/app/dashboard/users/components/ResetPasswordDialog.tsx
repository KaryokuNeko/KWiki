"use client"

import { useState } from "react"
import { XCircleIcon, CheckCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline"
import { User } from "./UserManagement"

interface ResetPasswordDialogProps {
  isOpen: boolean
  user: User
  onClose: () => void
  onSubmit: (userId: string, password: string, temporary: boolean) => Promise<{ success: boolean; error?: string }>
}

export function ResetPasswordDialog({ isOpen, user, onClose, onSubmit }: ResetPasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [temporary, setTemporary] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setLoading(true)

    const result = await onSubmit(user.id, password, temporary)

    setLoading(false)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 1500)
    } else {
      setError(result.error || "Failed to reset password")
    }
  }

  const handleClose = () => {
    setPassword("")
    setConfirmPassword("")
    setTemporary(false)
    setError(null)
    setSuccess(false)
    onClose()
  }

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <form method="dialog">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">Reset Password</h3>

        <div className="card bg-base-200 mb-4">
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
            </dl>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div role="alert" className="alert alert-error">
              <XCircleIcon className="h-6 w-6 shrink-0 stroke-current" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div role="alert" className="alert alert-success">
              <CheckCircleIcon className="h-6 w-6 shrink-0 stroke-current" />
              <span>Password reset successfully!</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                New Password <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={success}
              className="input input-bordered"
              placeholder="Enter new password"
            />
            <label className="label">
              <span className="label-text-alt">Minimum 8 characters</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Confirm Password <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={success}
              className="input input-bordered"
              placeholder="Confirm new password"
            />
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                checked={temporary}
                onChange={(e) => setTemporary(e.target.checked)}
                disabled={success}
                className="checkbox checkbox-primary"
              />
              <span className="label-text">Require password change on next login</span>
            </label>
          </div>

          <div role="alert" className="alert alert-info">
            <InformationCircleIcon className="h-6 w-6 shrink-0 stroke-current" />
            <span className="text-xs">
              This will reset the user's password immediately. If "Require password change on next login" is checked,
              the user will be prompted to change their password when they log in.
            </span>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn"
            >
              {success ? "Close" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="btn btn-warning"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Resetting...
                </>
              ) : success ? (
                "Password Reset!"
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={handleClose}>close</button>
      </form>
    </dialog>
  )
}
