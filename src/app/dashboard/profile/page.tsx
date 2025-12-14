import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { auth } from "@/auth"
import { SignOutButton } from "../components/SignOutButton"
import { ProfileEditor } from "./components/ProfileEditor"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  const t = await getTranslations('profile')
  const tCommon = await getTranslations('common')
  const tDashboard = await getTranslations('dashboard')

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-md">
        <div className="navbar-start">
          <div className="text-xl font-bold">{tDashboard('navbar.title')}</div>
        </div>
        <div className="navbar-center">
          <ul className="menu menu-horizontal px-1">
            <li>
              <a href="/dashboard">{tCommon('nav.home')}</a>
            </li>
            <li>
              <a href="/dashboard/profile" className="active">
                {tCommon('nav.profile')}
              </a>
            </li>
            <li>
              <a href="/dashboard/users">{tCommon('nav.userManagement')}</a>
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          <SignOutButton />
        </div>
      </div>

      <main className="container mx-auto p-6 max-w-3xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">{t('title')}</h2>
            <ProfileEditor />
          </div>
        </div>
      </main>
    </div>
  )
}
