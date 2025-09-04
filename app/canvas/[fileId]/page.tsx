import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CanvasWorkspace } from "@/components/canvas/canvas-workspace"

interface CanvasPageProps {
  params: {
    fileId: string
  }
}

export default async function CanvasPage({ params }: CanvasPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/sign-in")
  }

  const { data: file } = await supabase
    .from("project_files")
    .select(`
      *,
      project:projects(*)
    `)
    .eq("id", params.fileId)
    .eq("user_id", user.id)
    .single()

  if (!file) {
    redirect("/dashboard")
  }

  return <CanvasWorkspace file={file} />
}
