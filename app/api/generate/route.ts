import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Generate API called")

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] Auth check:", { user: user?.id, error: authError })

    if (authError || !user) {
      console.log("[v0] Unauthorized request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, newProjectName, prompt, styleReferenceUrl, parameters } = await request.json()
    console.log("[v0] Request data:", { projectId, newProjectName, prompt: prompt?.slice(0, 100) })

    if (!prompt?.trim()) {
      console.log("[v0] Missing prompt")
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check rate limiting - max 5 generations per minute
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    const { data: recentAssets, error: rateLimitError } = await supabase
      .from("generated_assets")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", oneMinuteAgo)
      .limit(10)

    if (rateLimitError) {
      console.error("[v0] Rate limit check error:", rateLimitError)
    }

    if (recentAssets && recentAssets.length >= 5) {
      console.log("[v0] Rate limit exceeded")
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before generating more assets." },
        { status: 429 },
      )
    }

    let finalProjectId = projectId

    // Create new project if requested
    if (!projectId && newProjectName?.trim()) {
      console.log("[v0] Creating new project:", newProjectName)
      const { data: newProject, error: projectError } = await supabase
        .from("asset_projects")
        .insert({
          user_id: user.id,
          name: newProjectName.trim(),
          description: `Generated from prompt: ${prompt.slice(0, 100)}...`,
        })
        .select()
        .single()

      if (projectError) {
        console.error("[v0] Project creation error:", projectError)
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
      }

      finalProjectId = newProject.id
      console.log("[v0] Created project:", finalProjectId)
    }

    // Create asset record with generating status
    console.log("[v0] Creating asset record")
    const { data: asset, error: assetError } = await supabase
      .from("generated_assets")
      .insert({
        project_id: finalProjectId,
        user_id: user.id,
        prompt: prompt.trim(),
        image_url: "", // Will be updated after generation
        parameters,
        status: "generating",
      })
      .select()
      .single()

    if (assetError) {
      console.error("[v0] Asset creation error:", assetError)
      return NextResponse.json({ error: "Failed to create asset record" }, { status: 500 })
    }

    console.log("[v0] Created asset:", asset.id)

    try {
      console.log("[v0] Starting AI generation")
      const { generateAsset } = await import("@/lib/ai/gemini")

      const result = await generateAsset({
        prompt: prompt.trim(),
        styleReferenceUrl,
        parameters: parameters || {},
      })

      console.log("[v0] AI generation completed:", result.imageUrl ? "success" : "no image")

      // Update asset with generated image
      const { error: updateError } = await supabase
        .from("generated_assets")
        .update({
          image_url: result.imageUrl,
          parameters: { ...parameters, metadata: result.metadata },
          status: "completed",
        })
        .eq("id", asset.id)

      if (updateError) {
        console.error("[v0] Asset update error:", updateError)
        return NextResponse.json({ error: "Failed to update asset" }, { status: 500 })
      }

      console.log("[v0] Generation successful")
      return NextResponse.json({
        success: true,
        projectId: finalProjectId,
        asset: {
          ...asset,
          image_url: result.imageUrl,
          parameters: { ...parameters, metadata: result.metadata },
          status: "completed",
        },
      })
    } catch (generationError) {
      console.error("[v0] Generation error:", generationError)

      // Update asset status to failed
      await supabase
        .from("generated_assets")
        .update({
          status: "failed",
          parameters: {
            ...parameters,
            errorMessage: generationError instanceof Error ? generationError.message : "Generation failed",
          },
        })
        .eq("id", asset.id)

      return NextResponse.json(
        {
          error: "Failed to generate asset",
          details: generationError instanceof Error ? generationError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
