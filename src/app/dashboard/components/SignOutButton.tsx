"use client"

import { signOut } from "next-auth/react"
import { useTranslations } from 'next-intl'

export function SignOutButton() {
  const t = useTranslations('auth')

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn btn-error"
    >
      {t('signOut')}
    </button>
  )
}
