'use client'

import { useLocale } from 'next-intl'
import { locales, localeNames, localeIcons, type Locale } from '@/i18n/config'
import { useSession } from 'next-auth/react'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale
  const { data: session } = useSession()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const switchLocale = async (newLocale: Locale) => {
    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`

    // If logged in, update database
    if (session?.user) {
      try {
        await fetch('/api/profile/locale', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: newLocale }),
        })
      } catch (error) {
        console.error('Failed to update locale preference:', error)
      }
    }

    // Refresh the page to apply new locale
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
        <span>{localeIcons[currentLocale]}</span>
        <span>{localeNames[currentLocale]}</span>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-4 z-50"
      >
        {locales.map((locale) => (
          <li key={locale}>
            <button
              onClick={() => switchLocale(locale)}
              className={currentLocale === locale ? 'active' : ''}
              disabled={isPending}
            >
              <span>{localeIcons[locale]}</span>
              <span>{localeNames[locale]}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
