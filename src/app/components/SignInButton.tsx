"use client"

import { signIn } from "next-auth/react"

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}
      className="btn btn-primary w-full"
    >
      Sign in with Keycloak
    </button>
  )
}
