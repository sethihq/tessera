"use client"

import type React from "react"
import { AuthProvider as BetterAuthProvider } from "@daveyplate/better-auth-ui"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <BetterAuthProvider
      authClient={{
        baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
      }}
    >
      {children}
    </BetterAuthProvider>
  )
}

export { useAuth } from "@daveyplate/better-auth-ui"
