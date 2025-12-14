'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { SignInButton } from './SignInButton'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function FloatingNav() {
  const { data: session } = useSession()
  const t = useTranslations('common')

  return (
    <div className="navbar fixed top-0 left-0 right-0 z-50 bg-base-100/80 backdrop-blur-sm shadow-sm">
      <div className="navbar-start">
        <Link href="/" className="text-xl font-bold px-4">
          {t('app.name')}
        </Link>
      </div>
      <div className="navbar-end gap-2 px-4">
        <LanguageSwitcher />
        {session ? (
          <Link href="/dashboard" className="btn btn-primary btn-sm min-w-24">
            {t('nav.dashboard')}
          </Link>
        ) : (
          <SignInButton />
        )}
      </div>
    </div>
  )
}
