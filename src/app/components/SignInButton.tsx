"use client"

import { signIn } from "next-auth/react"
import { useTranslations } from 'next-intl'

export function SignInButton() {
  const t = useTranslations('auth')

  return (
    <button
      onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}
      className="btn btn-primary w-full"
    >
      {t('signIn')}
    </button>
  )
}
