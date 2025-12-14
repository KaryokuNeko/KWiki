import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SignOutButton } from "./components/SignOutButton"
import { getTranslations } from 'next-intl/server'
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default async function DashboardPage() {
  const session = await auth()
  const t = await getTranslations('common')
  const tDashboard = await getTranslations('dashboard')

  if (!session?.user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-md">
        <div className="navbar-start">
          <div className="text-xl font-bold">{tDashboard('title')}</div>
        </div>
        <div className="navbar-center">
          <ul className="menu menu-horizontal px-1">
            <li>
              <a href="/dashboard" className="active">
                {t('nav.home')}
              </a>
            </li>
            <li>
              <a href="/dashboard/profile">{t('nav.profile')}</a>
            </li>
            <li>
              <a href="/dashboard/users">{t('nav.userManagement')}</a>
            </li>
          </ul>
        </div>
        <div className="navbar-end gap-2">
          <LanguageSwitcher />
          <SignOutButton />
        </div>
      </div>

      <main className="container mx-auto p-6">
      </main>
    </div>
  )
}
