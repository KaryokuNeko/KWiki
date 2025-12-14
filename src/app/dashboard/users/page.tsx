import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { auth } from "@/auth"
import { UserManagement } from "./components/UserManagement"

export default async function UsersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

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
              <a href="/dashboard/profile">{tCommon('nav.profile')}</a>
            </li>
            <li>
              <a href="/dashboard/users" className="active">
                {tCommon('nav.userManagement')}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <main className="container mx-auto p-6">
        <UserManagement />
      </main>
    </div>
  )
}
