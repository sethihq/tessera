import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { CreateSpriteSheetRequest, SpriteSheet } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')

    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Build query
    let query = supabase
      .from('sprite_sheets')
      .select(`
        *,
        frames:sprite_sheet_frames(*),
        project:asset_projects(id, name),
        world_style:world_styles(id, name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Filter by project if specified
    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data: spriteSheets, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      sprite_sheets: spriteSheets || [],
      total: spriteSheets?.length || 0
    })

  } catch (error) {
    console.error("[API] Get sprite sheets error:", error)
    
    return NextResponse.json(
      { error: "Failed to fetch sprite sheets" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSpriteSheetRequest = await request.json()
    
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Validate required fields
    if (!body.name || !body.base_character?.description) {
      return NextResponse.json(
        { error: "Name and base character description are required" },
        { status: 400 }
      )
    }

    // Create sprite sheet
    const spriteSheetData = {
      user_id: user.id,
      name: body.name,
      description: body.description,
      project_id: body.project_id,
      world_style_id: body.world_style_id,
      base_character: body.base_character,
      dimensions: body.dimensions,
      frame_size: body.frame_size,
      output_settings: {
        background: "transparent",
        format: "png",
        spacing: 2,
        border: 1,
        quality: "high",
        optimization: "game_ready",
        ...body.output_settings
      },
      status: 'draft',
      generation_progress: {
        completed_frames: 0,
        total_frames: body.dimensions.rows * body.dimensions.cols
      }
    }

    const { data: spriteSheet, error } = await supabase
      .from('sprite_sheets')
      .insert([spriteSheetData])
      .select()
      .single()

    if (error) {
      throw error
    }

    // If a template is specified, apply template frames
    if (body.template_id) {
      const { data: template, error: templateError } = await supabase
        .from('sprite_sheet_templates')
        .select('*')
        .eq('id', body.template_id)
        .single()

      if (template && !templateError) {
        // Apply template properties to frames
        const { data: frames } = await supabase
          .from('sprite_sheet_frames')
          .select('*')
          .eq('sprite_sheet_id', spriteSheet.id)

        if (frames) {
          const frameUpdates = frames.map(frame => {
            const templateFrame = template.template_data.frames.find(
              (tf: any) => tf.position.row === frame.position.row && tf.position.col === frame.position.col
            )
            
            if (templateFrame) {
              return {
                id: frame.id,
                properties: { ...frame.properties, ...templateFrame.properties }
              }
            }
            return null
          }).filter(Boolean)

          // Update frames with template properties
          for (const update of frameUpdates) {
            if (update) {
              await supabase
                .from('sprite_sheet_frames')
                .update({ properties: update.properties })
                .eq('id', update.id)
            }
          }
        }
      }
    }

    // Fetch the complete sprite sheet with frames
    const { data: completeSpriteSheet, error: fetchError } = await supabase
      .from('sprite_sheets')
      .select(`
        *,
        frames:sprite_sheet_frames(*)
      `)
      .eq('id', spriteSheet.id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    return NextResponse.json({
      success: true,
      sprite_sheet: completeSpriteSheet
    })

  } catch (error) {
    console.error("[API] Create sprite sheet error:", error)
    
    return NextResponse.json(
      { 
        error: "Failed to create sprite sheet",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
