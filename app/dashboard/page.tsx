import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProjectsDashboard } from "@/components/dashboard/projects-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/sign-in")
  }

  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      files:project_files(*)
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  const { data: recentFiles } = await supabase
    .from("project_files")
    .select(`
      *,
      project:projects(name)
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(6)

  return <ProjectsDashboard projects={projects || []} recentFiles={recentFiles || []} user={user} />
}
