"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
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
  const t = useTranslations('users')
  const tCommon = useTranslations('common')
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
          <h3 className="card-title">{t('list.empty.title')}</h3>
          <p className="text-base-content/60">
            {t('list.empty.description')}
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
                <th>{t('list.headers.username')}</th>
                <th>{t('list.headers.email')}</th>
                <th>{t('list.headers.name')}</th>
                <th>{t('list.headers.status')}</th>
                <th>{t('list.headers.emailVerified')}</th>
                <th className="text-right">{t('list.headers.actions')}</th>
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
                      <span className="badge badge-success badge-sm">{tCommon('common.active')}</span>
                    ) : (
                      <span className="badge badge-error badge-sm">{tCommon('common.disabled')}</span>
                    )}
                  </td>
                  <td>
                    {user.emailVerified ? (
                      <div className="tooltip" data-tip={t('list.tooltips.verified')}>
                        <CheckCircleIconSolid className="w-5 h-5 text-success" />
                      </div>
                    ) : (
                      <div className="tooltip" data-tip={t('list.tooltips.notVerified')}>
                        <XCircleIconSolid className="w-5 h-5 text-base-content/30" />
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="btn btn-ghost btn-xs"
                        title={t('list.tooltips.edit')}
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setResetPasswordUser(user)}
                        className="btn btn-ghost btn-xs text-warning"
                        title={t('list.tooltips.resetPassword')}
                      >
                        <KeyIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(user)}
                        className="btn btn-ghost btn-xs text-error"
                        title={t('list.tooltips.delete')}
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
