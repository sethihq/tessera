import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProjectContent } from "@/components/projects/project-content"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get project details
  const { data: project, error: projectError } = await supabase
    .from("asset_projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Get project assets
  const { data: assets } = await supabase
    .from("generated_assets")
    .select("*")
    .eq("project_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <ProjectContent project={project} assets={assets || []} />
}
