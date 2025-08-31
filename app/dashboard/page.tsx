import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { db, profiles, assetProjects, generatedAssets } from "@/lib/db"
import { eq, desc } from "drizzle-orm"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  let profile = null
  let recentProjects: any[] = []
  let recentAssets: any[] = []

  try {
    profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, session.user.id),
    })

    recentProjects = await db
      .select()
      .from(assetProjects)
      .where(eq(assetProjects.userId, session.user.id))
      .orderBy(desc(assetProjects.createdAt))
      .limit(6)

    const recentAssetsWithProjects = await db
      .select({
        id: generatedAssets.id,
        projectId: generatedAssets.projectId,
        userId: generatedAssets.userId,
        prompt: generatedAssets.prompt,
        imageUrl: generatedAssets.imageUrl,
        status: generatedAssets.status,
        parameters: generatedAssets.parameters,
        createdAt: generatedAssets.createdAt,
        updatedAt: generatedAssets.updatedAt,
        projectName: assetProjects.name,
      })
      .from(generatedAssets)
      .leftJoin(assetProjects, eq(generatedAssets.projectId, assetProjects.id))
      .where(eq(generatedAssets.userId, session.user.id))
      .orderBy(desc(generatedAssets.createdAt))
      .limit(8)

    recentAssets = recentAssetsWithProjects.map((asset) => ({
      ...asset,
      asset_projects: asset.projectName ? { name: asset.projectName } : undefined,
    }))
  } catch (error) {
    console.error("[v0] Database query error:", error)
    // Continue with empty data rather than crashing
  }

  return (
    <DashboardContent user={session.user} profile={profile} projects={recentProjects} recentAssets={recentAssets} />
  )
}
