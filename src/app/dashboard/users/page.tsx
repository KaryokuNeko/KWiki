import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { UserManagement } from "./components/UserManagement"

export default async function UsersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-md">
        <div className="navbar-start">
          <div className="text-xl font-bold">K-Wiki Dashboard</div>
        </div>
        <div className="navbar-center">
          <ul className="menu menu-horizontal px-1">
            <li>
              <a href="/dashboard">Home</a>
            </li>
            <li>
              <a href="/dashboard/users" className="active">
                User Management
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
