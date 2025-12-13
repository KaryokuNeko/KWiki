import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SignOutButton } from "../components/SignOutButton"
import { ProfileEditor } from "./components/ProfileEditor"

export default async function ProfilePage() {
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
              <a href="/dashboard/profile" className="active">
                Profile
              </a>
            </li>
            <li>
              <a href="/dashboard/users">User Management</a>
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
            <h2 className="card-title text-2xl mb-4">User Profile</h2>
            <ProfileEditor />
          </div>
        </div>
      </main>
    </div>
  )
}
