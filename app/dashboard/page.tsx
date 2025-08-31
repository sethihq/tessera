import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UnifiedDashboard } from "@/components/dashboard/unified-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/sign-in")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

  // Get recent projects
  const { data: projects } = await supabase
    .from("asset_projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(6)

  // Get recent assets with project info
  const { data: assets } = await supabase
    .from("generated_assets")
    .select(`
      *,
      asset_projects (
        id,
        name
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8)

  return <UnifiedDashboard user={user} profile={profile} projects={projects || []} recentAssets={assets || []} />
}
