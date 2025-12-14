'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { locales, localeNames, type Locale } from '@/i18n/config'

type Theme = 'light' | 'dark' | 'system'

export function ThemeLanguageSettings() {
  const t = useTranslations('profile.preferences')
  const router = useRouter()
  const currentLocale = useLocale() as Locale
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()

  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      applyTheme('system')
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement

    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.setAttribute('data-theme', systemTheme)
    } else {
      root.setAttribute('data-theme', newTheme)
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const handleLanguageChange = async (newLocale: Locale) => {
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

  // Listen to system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme('system')

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">{t('theme.label')}</span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`btn btn-sm flex-1 ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
            {t('theme.light')}
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`btn btn-sm flex-1 ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              />
            </svg>
            {t('theme.dark')}
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`btn btn-sm flex-1 ${theme === 'system' ? 'btn-primary' : 'btn-outline'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
              />
            </svg>
            {t('theme.system')}
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">{t('language.label')}</span>
        </label>
        <div className="flex gap-2">
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => handleLanguageChange(locale)}
              disabled={isPending}
              className={`btn btn-sm flex-1 ${currentLocale === locale ? 'btn-primary' : 'btn-outline'}`}
            >
              {isPending && currentLocale !== locale && (
                <span className="loading loading-spinner loading-xs"></span>
              )}
              {localeNames[locale]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
