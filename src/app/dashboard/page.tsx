import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SignOutButton } from "./components/SignOutButton"

export default async function DashboardPage() {
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
              <a href="/dashboard" className="active">
                Home
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

      <main className="container mx-auto p-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl">User Information</h2>

            <div className="space-y-4 mt-4">
              {session.user.image && (
                <div className="flex items-center space-x-4">
                  <div className="avatar">
                    <div className="w-20 rounded-full">
                      <img src={session.user.image} alt="User avatar" />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Name</div>
                  <div className="stat-value text-xl">
                    {session.user.name || "N/A"}
                  </div>
                </div>

                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Email</div>
                  <div className="stat-value text-xl">
                    {session.user.email || "N/A"}
                  </div>
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-medium">Full Session Data</div>
                <div className="collapse-content">
                  <pre className="text-sm bg-base-300 p-4 rounded overflow-x-auto">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
