import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GenerateContent } from "@/components/generate/generate-content"

export default async function GeneratePage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user's projects for the dropdown
  const { data: projects } = await supabase
    .from("asset_projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  return <GenerateContent user={user} projects={projects || []} />
}
