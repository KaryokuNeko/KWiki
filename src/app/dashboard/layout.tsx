import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SignOutButton } from "./components/SignOutButton"
import { getTranslations } from 'next-intl/server'
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const t = await getTranslations('common')
  const tDashboard = await getTranslations('dashboard')

  if (!session?.user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-md">
        <div className="navbar-start px-4">
          <div className="text-xl font-bold">{tDashboard('title')}</div>
        </div>
        <div className="navbar-center">
          <ul className="menu menu-horizontal px-1">
            <li>
              <a href="/">
                {t('nav.home')}
              </a>
            </li>
            <li>
              <a href="/dashboard/profile">{t('nav.profile')}</a>
            </li>
            <li>
              <a href="/dashboard/users">{t('nav.userManagement')}</a>
            </li>
            <li>
              <details>
                <summary>{t('nav.contentManagement')}</summary>
                <ul className="p-2 bg-base-100 rounded-box z-50 w-48">
                  <li><a href="/dashboard/content/videos">{t('nav.videos')}</a></li>
                  <li><a href="/dashboard/content/characters">{t('nav.characters')}</a></li>
                  <li><a href="/dashboard/content/items">{t('nav.items')}</a></li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
        <div className="navbar-end gap-2 px-4">
          <LanguageSwitcher />
          <SignOutButton />
        </div>
      </div>

      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  )
}
