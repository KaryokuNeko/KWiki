"use client"

import { signIn } from "next-auth/react"

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
    >
      Sign in with Keycloak
    </button>
  )
}
