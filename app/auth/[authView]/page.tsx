import AuthPageClient from "./AuthPageClient"

export default function AuthPage({
  params,
}: {
  params: { authView: string }
}) {
  return <AuthPageClient params={params} />
}

export function generateStaticParams() {
  return [
    { authView: "sign-in" },
    { authView: "sign-up" },
    { authView: "forgot-password" },
    { authView: "reset-password" },
  ]
}
