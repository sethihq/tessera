"use client"

import { AuthView } from "@daveyplate/better-auth-ui"

export default function AuthPageClient({
  params,
}: {
  params: { authView: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <AuthView
          authView={params.authView as any}
          onSuccess={() => {
            window.location.href = "/dashboard"
          }}
        />
      </div>
    </div>
  )
}
