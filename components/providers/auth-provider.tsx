"use client"

import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import { authClient } from "@/lib/auth-client"
import type React from "react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthUIProvider authClient={authClient}>{children}</AuthUIProvider>
}

export { useSession } from "@/lib/auth-client"
