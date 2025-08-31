import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, newProjectName, prompt, styleReferenceUrl, parameters } = await request.json()

    if (!prompt?.trim()) {
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
      console.error("Rate limit check error:", rateLimitError)
    }

    if (recentAssets && recentAssets.length >= 5) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before generating more assets." },
        { status: 429 },
      )
    }

    let finalProjectId = projectId

    // Create new project if requested
    if (!projectId && newProjectName?.trim()) {
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
        console.error("Project creation error:", projectError)
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
      }

      finalProjectId = newProject.id
    }

    // Create asset record with generating status
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
      console.error("Asset creation error:", assetError)
      return NextResponse.json({ error: "Failed to create asset record" }, { status: 500 })
    }

    try {
      const { generateAsset } = await import("@/lib/ai/gemini")

      const result = await generateAsset({
        prompt: prompt.trim(),
        styleReferenceUrl,
        parameters: parameters || {},
      })

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
        console.error("Asset update error:", updateError)
        return NextResponse.json({ error: "Failed to update asset" }, { status: 500 })
      }

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
    console.error("Generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
