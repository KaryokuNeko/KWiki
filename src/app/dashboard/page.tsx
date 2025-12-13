import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SignOutButton } from "./components/SignOutButton"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              K-Wiki Dashboard
            </h1>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              User Information
            </h2>

            <div className="space-y-4">
              {session.user.image && (
                <div className="flex items-center space-x-4">
                  <img
                    src={session.user.image}
                    alt="User avatar"
                    className="w-20 h-20 rounded-full"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </p>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">
                    {session.user.name || "N/A"}
                  </p>
                </div>

                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">
                    {session.user.email || "N/A"}
                  </p>
                </div>
              </div>

              <div className="border dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Full Session Data
                </p>
                <pre className="mt-1 text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-x-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
