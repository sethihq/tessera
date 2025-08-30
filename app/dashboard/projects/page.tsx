import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProjectsContent } from "@/components/projects/projects-content"

export default async function ProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get all user projects
  const { data: projects } = await supabase
    .from("asset_projects")
    .select(`
      *,
      generated_assets(count)
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  return <ProjectsContent projects={projects || []} />
}
