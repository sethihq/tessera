import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { generatedAssets, assetProjects } from "@/lib/db/schema"
import { eq, ilike, desc, asc } from "drizzle-orm"
import { AssetsContent } from "@/components/assets/assets-content"

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; project?: string; sort?: string }>
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  const params = await searchParams
  const { search, project, sort = "created_at" } = params

  const whereConditions = [eq(generatedAssets.userId, session.user.id)]

  // Apply filters
  if (project) {
    whereConditions.push(eq(generatedAssets.projectId, project))
  }

  if (search) {
    whereConditions.push(ilike(generatedAssets.prompt, `%${search}%`))
  }

  const assets = await db
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
      asset_projects: {
        id: assetProjects.id,
        name: assetProjects.name,
      },
    })
    .from(generatedAssets)
    .leftJoin(assetProjects, eq(generatedAssets.projectId, assetProjects.id))
    .where(
      whereConditions.length > 1 ? whereConditions.reduce((acc, condition) => acc && condition) : whereConditions[0],
    )
    .orderBy(
      sort === "name"
        ? asc(generatedAssets.prompt)
        : sort === "created_at"
          ? desc(generatedAssets.createdAt)
          : desc(generatedAssets.updatedAt),
    )

  const projects = await db
    .select()
    .from(assetProjects)
    .where(eq(assetProjects.userId, session.user.id))
    .orderBy(asc(assetProjects.name))

  return <AssetsContent assets={assets || []} projects={projects || []} />
}
