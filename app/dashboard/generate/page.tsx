import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { assetProjects } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { GenerateContent } from "@/components/generate/generate-content"

export default async function GeneratePage() {
  const session = await getSession()

  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  let projects: any[] = []
  try {
    projects = await db
      .select()
      .from(assetProjects)
      .where(eq(assetProjects.userId, session.user.id))
      .orderBy(desc(assetProjects.updatedAt))
  } catch (error) {
    console.error("[v0] Error fetching projects:", error)
    // Continue with empty projects array
  }

  return <GenerateContent projects={projects} />
}
