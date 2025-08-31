import { redirect } from "next/navigation"

export default function AuthPage({
  params,
}: {
  params: { authView: string }
}) {
  if (params.authView === "sign-in") {
    redirect("/auth/sign-in")
  }
  if (params.authView === "sign-up") {
    redirect("/auth/sign-up")
  }
  if (params.authView === "forgot-password") {
    redirect("/auth/error?error=forgot-password-not-implemented")
  }
  if (params.authView === "reset-password") {
    redirect("/auth/error?error=reset-password-not-implemented")
  }

  // Default redirect for unknown auth views
  redirect("/auth/sign-in")
}

export function generateStaticParams() {
  return [
    { authView: "sign-in" },
    { authView: "sign-up" },
    { authView: "forgot-password" },
    { authView: "reset-password" },
  ]
}
