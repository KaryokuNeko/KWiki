"use client"

import { useState, useEffect } from "react"
import { XCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline"
import { useTranslations } from "next-intl"
import { User } from "./UserManagement"

interface EditUserDialogProps {
  isOpen: boolean
  user: User
  onClose: () => void
  onSubmit: (
    userId: string,
    updates: {
      email?: string
      firstName?: string
      lastName?: string
      enabled?: boolean
      emailVerified?: boolean
    }
  ) => Promise<{ success: boolean; error?: string }>
}

export function EditUserDialog({ isOpen, user, onClose, onSubmit }: EditUserDialogProps) {
  const t = useTranslations('users')
  const tCommon = useTranslations('common')
  const [formData, setFormData] = useState({
    email: user.email,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    enabled: user.enabled ?? true,
    emailVerified: user.emailVerified ?? false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setFormData({
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      enabled: user.enabled ?? true,
      emailVerified: user.emailVerified ?? false,
    })
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await onSubmit(user.id, {
      email: formData.email,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      enabled: formData.enabled,
      emailVerified: formData.emailVerified,
    })

    setLoading(false)

    if (result.success) {
      onClose()
    } else {
      setError(result.error || "Failed to update user")
    }
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  if (!isOpen) return null

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
        <h3 className="font-bold text-lg mb-4">{t('editDialog.title')}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div role="alert" className="alert alert-error">
              <XCircleIcon className="h-6 w-6 shrink-0 stroke-current" />
              <span>{error}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              type="text"
              disabled
              value={user.username}
              className="input input-bordered input-disabled"
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                {t('editDialog.hints.usernameReadonly')}
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                {t('createDialog.fields.email')} <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input input-bordered"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('createDialog.fields.firstName')}</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input input-bordered"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('createDialog.fields.lastName')}</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input input-bordered"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="checkbox checkbox-primary"
              />
              <span className="label-text">{t('createDialog.hints.enabled')}</span>
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
              <span className="label-text">{t('createDialog.hints.emailVerified')}</span>
            </label>
          </div>

          <div role="alert" className="alert alert-info">
            <InformationCircleIcon className="h-6 w-6 shrink-0 stroke-current" />
            <span>{t('editDialog.hints.passwordNote')}</span>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn"
            >
              {tCommon('buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  {tCommon('status.updating')}
                </>
              ) : (
                <>
                  {tCommon('buttons.update')} {t('editDialog.title')}
                </>
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
