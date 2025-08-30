import { AuthView, authViewPaths } from "@daveyplate/better-auth-ui"

export const dynamicParams = false

export function generateStaticParams() {
  return authViewPaths.map((path) => ({
    authView: path,
  }))
}

export default function AuthPage({
  params,
}: {
  params: { authView: string }
}) {
  return <AuthView path={params.authView} />
}
