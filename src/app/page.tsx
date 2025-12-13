import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SignInButton } from "./components/SignInButton"

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              K-Wiki
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome to K-Wiki Knowledge Base
            </p>
          </div>

          <div className="space-y-4">
            <SignInButton />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use your Keycloak account to sign in
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
