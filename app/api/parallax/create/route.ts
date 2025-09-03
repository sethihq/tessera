import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[Parallax] Create parallax asset API called")

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, newProjectName, templateId, layers } = await request.json()

    if (!layers || layers.length === 0) {
      return NextResponse.json({ error: "At least one layer is required" }, { status: 400 })
    }

    let finalProjectId = projectId

    // Create new project if requested
    if (!projectId && newProjectName?.trim()) {
      const { data: newProject, error: projectError } = await supabase
        .from("asset_projects")
        .insert({
          user_id: user.id,
          name: newProjectName.trim(),
          description: `Parallax background generated from template: ${templateId}`,
        })
        .select()
        .single()

      if (projectError) {
        console.error("[Parallax] Project creation error:", projectError)
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
      }

      finalProjectId = newProject.id
    }

    // Create the main parallax asset record
    const { data: asset, error: assetError } = await supabase
      .from("generated_assets")
      .insert({
        project_id: finalProjectId,
        user_id: user.id,
        prompt: `Parallax background with ${layers.length} layers: ${layers.map((l: any) => l.name).join(', ')}`,
        asset_type: 'parallax-background',
        status: "completed",
        parameters: {
          template_id: templateId,
          total_layers: layers.length,
          layer_configuration: layers.map((l: any) => ({
            name: l.name,
            type: l.type,
            depth: l.depth,
            scrollSpeed: l.scrollSpeed,
            opacity: l.opacity
          }))
        }
      })
      .select()
      .single()

    if (assetError) {
      console.error("[Parallax] Asset creation error:", assetError)
      return NextResponse.json({ error: "Failed to create parallax asset" }, { status: 500 })
    }

    // Create individual layer records
    const layerInserts = layers.map((layer: any, index: number) => ({
      asset_id: asset.id,
      layer_index: index,
      layer_name: layer.name,
      layer_type: layer.type,
      image_url: layer.imageUrl,
      depth_factor: layer.depth,
      scroll_speed: layer.scrollSpeed,
      opacity: layer.opacity,
      blend_mode: 'normal',
      position_offset: { x: 0, y: 0 }
    }))

    const { error: layersError } = await supabase
      .from("parallax_layers")
      .insert(layerInserts)

    if (layersError) {
      console.error("[Parallax] Layers creation error:", layersError)
      return NextResponse.json({ error: "Failed to create layer records" }, { status: 500 })
    }

    console.log("[Parallax] Successfully created parallax asset with layers")
    
    return NextResponse.json({
      success: true,
      asset: {
        ...asset,
        layers: layerInserts
      },
      projectId: finalProjectId
    })

  } catch (error) {
    console.error("[Parallax] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
