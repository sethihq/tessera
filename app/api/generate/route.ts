import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { assetProjects, generatedAssets } from "@/lib/db/schema"
import { eq, gte, and } from "drizzle-orm"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, newProjectName, prompt, styleReferenceUrl, parameters } = await request.json()

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const recentAssets = await db
      .select({ id: generatedAssets.id })
      .from(generatedAssets)
      .where(
        and(
          eq(generatedAssets.userId, session.user.id),
          gte(generatedAssets.createdAt, new Date(Date.now() - 60000)), // Last minute
        ),
      )
      .limit(10)

    if (recentAssets.length >= 5) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before generating more assets." },
        { status: 429 },
      )
    }

    let finalProjectId = projectId

    if (!projectId && newProjectName?.trim()) {
      const [newProject] = await db
        .insert(assetProjects)
        .values({
          userId: session.user.id,
          name: newProjectName.trim(),
          description: `Generated from prompt: ${prompt.slice(0, 100)}...`,
        })
        .returning()

      finalProjectId = newProject.id
    }

    const [asset] = await db
      .insert(generatedAssets)
      .values({
        projectId: finalProjectId,
        userId: session.user.id,
        prompt: prompt.trim(),
        imageUrl: "", // Will be updated after generation
        parameters,
        status: "generating",
      })
      .returning()

    try {
      const { generateAsset } = await import("@/lib/ai/gemini")

      const result = await generateAsset({
        prompt: prompt.trim(),
        styleReferenceUrl,
        parameters: parameters || {},
      })

      await db
        .update(generatedAssets)
        .set({
          imageUrl: result.imageUrl,
          parameters: { ...parameters, metadata: result.metadata },
          status: "completed",
        })
        .where(eq(generatedAssets.id, asset.id))

      return NextResponse.json({
        success: true,
        projectId: finalProjectId,
        asset: {
          ...asset,
          imageUrl: result.imageUrl,
          parameters: { ...parameters, metadata: result.metadata },
          status: "completed",
        },
      })
    } catch (generationError) {
      await db
        .update(generatedAssets)
        .set({
          status: "failed",
          parameters: {
            ...parameters,
            errorMessage: generationError instanceof Error ? generationError.message : "Generation failed",
          },
        })
        .where(eq(generatedAssets.id, asset.id))

      return NextResponse.json(
        {
          error: "Failed to generate asset",
          details: generationError instanceof Error ? generationError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
