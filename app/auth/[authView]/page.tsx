"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthPage({
  params,
}: {
  params: { authView: string }
}) {
  const router = useRouter()

  useEffect(() => {
    // Redirect old Better Auth UI routes to new Supabase auth pages
    switch (params.authView) {
      case "sign-up":
        router.replace("/auth/sign-up")
        break
      case "sign-in":
      default:
        router.replace("/auth/sign-in")
        break
    }
  }, [params.authView, router])

  return null
}
