"use client"

import { useState } from "react"
import { XCircleIcon } from "@heroicons/react/24/outline"

interface CreateUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userData: {
    username: string
    email: string
    firstName?: string
    lastName?: string
    password?: string
    enabled?: boolean
    emailVerified?: boolean
    temporary?: boolean
  }) => Promise<{ success: boolean; error?: string }>
}

export function CreateUserDialog({ isOpen, onClose, onSubmit }: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    enabled: true,
    emailVerified: false,
    temporary: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await onSubmit({
      username: formData.username,
      email: formData.email,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      password: formData.password || undefined,
      enabled: formData.enabled,
      emailVerified: formData.emailVerified,
      temporary: formData.temporary,
    })

    setLoading(false)

    if (result.success) {
      setFormData({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        enabled: true,
        emailVerified: false,
        temporary: false,
      })
      onClose()
    } else {
      setError(result.error || "Failed to create user")
    }
  }

  const handleClose = () => {
    setFormData({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      enabled: true,
      emailVerified: false,
      temporary: false,
    })
    setError(null)
    onClose()
  }

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-2xl">
        <form method="dialog">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">Create New User</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div role="alert" className="alert alert-error">
              <XCircleIcon className="h-6 w-6 shrink-0 stroke-current" />
              <span>{error}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Username <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input input-bordered"
              placeholder="Enter username"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Email <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input input-bordered"
              placeholder="user@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input input-bordered"
                placeholder="John"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input input-bordered"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input input-bordered"
              placeholder="Leave empty to skip"
            />
            <label className="label">
              <span className="label-text-alt">
                Minimum 8 characters. Leave empty to set password later.
              </span>
            </label>
          </div>

          {formData.password && (
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  checked={formData.temporary}
                  onChange={(e) => setFormData({ ...formData, temporary: e.target.checked })}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Require password change on first login</span>
              </label>
            </div>
          )}

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="checkbox checkbox-primary"
              />
              <span className="label-text">Enable user account</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                checked={formData.emailVerified}
                onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })}
                className="checkbox checkbox-primary"
              />
              <span className="label-text">Mark email as verified</span>
            </label>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creating...
                </>
              ) : (
                "Create User"
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
