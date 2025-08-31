import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { 
  generateSpriteSheetFrames, 
  validateSpriteSheetConfiguration 
} from "@/lib/ai/sprite-sheet-generator"
import type { 
  GenerateSpriteSheetRequest, 
  SpriteSheet,
  SpriteSheetGenerationRequest 
} from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSpriteSheetRequest = await request.json()
    const { sprite_sheet_id, frame_ids, priority = "quality" } = body

    console.log("[API] Starting sprite sheet generation for:", sprite_sheet_id)

    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Fetch sprite sheet with frames
    const { data: spriteSheetData, error: fetchError } = await supabase
      .from('sprite_sheets')
      .select(`
        *,
        frames:sprite_sheet_frames(*)
      `)
      .eq('id', sprite_sheet_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !spriteSheetData) {
      return NextResponse.json(
        { error: "Sprite sheet not found or access denied" },
        { status: 404 }
      )
    }

    const spriteSheet = spriteSheetData as SpriteSheet

    // Validate sprite sheet configuration
    const validation = validateSpriteSheetConfiguration(spriteSheet)
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid sprite sheet configuration", details: validation.errors },
        { status: 400 }
      )
    }

    // Get world style if specified
    let worldStyle = null
    if (spriteSheet.world_style_id) {
      const { data: worldStyleData } = await supabase
        .from('world_styles')
        .select('*')
        .eq('id', spriteSheet.world_style_id)
        .eq('user_id', user.id)
        .single()
      
      worldStyle = worldStyleData
    }

    // Update sprite sheet status to generating
    await supabase
      .from('sprite_sheets')
      .update({ 
        status: 'generating',
        generation_progress: {
          completed_frames: 0,
          total_frames: spriteSheet.frames.length,
          current_frame: null
        }
      })
      .eq('id', sprite_sheet_id)

    // Update frame statuses to generating for frames that will be processed
    const framesToGenerate = frame_ids 
      ? spriteSheet.frames.filter(frame => frame_ids.includes(frame.id))
      : spriteSheet.frames.filter(frame => frame.status === 'pending')

    if (framesToGenerate.length > 0) {
      await supabase
        .from('sprite_sheet_frames')
        .update({ status: 'generating' })
        .in('id', framesToGenerate.map(f => f.id))
    }

    // Start generation process in background
    const generationRequest: SpriteSheetGenerationRequest = {
      sprite_sheet: spriteSheet,
      frames_to_generate: frame_ids,
      world_style: worldStyle,
      priority,
      batch_size: priority === "speed" ? 5 : 3
    }

    // Process generation asynchronously
    setImmediate(async () => {
      try {
        const result = await generateSpriteSheetFrames(generationRequest)
        
        // Update sprite sheet with final status
        const finalStatus = result.failed_frames > 0 ? 'error' : 'completed'
        
        await supabase
          .from('sprite_sheets')
          .update({ 
            status: finalStatus,
            generation_progress: {
              completed_frames: result.generated_frames,
              total_frames: spriteSheet.frames.length,
              errors: result.errors || []
            }
          })
          .eq('id', sprite_sheet_id)

        console.log("[API] Sprite sheet generation completed:", {
          sprite_sheet_id,
          generated_frames: result.generated_frames,
          failed_frames: result.failed_frames,
          total_time: result.metadata.total_generation_time
        })

      } catch (generationError) {
        console.error("[API] Generation error:", generationError)
        
        // Update sprite sheet status to error
        await supabase
          .from('sprite_sheets')
          .update({ 
            status: 'error',
            generation_progress: {
              completed_frames: 0,
              total_frames: spriteSheet.frames.length,
              errors: [generationError instanceof Error ? generationError.message : "Unknown error"]
            }
          })
          .eq('id', sprite_sheet_id)
      }
    })

    return NextResponse.json({
      success: true,
      message: "Generation started",
      sprite_sheet_id,
      frames_to_generate: framesToGenerate.length,
      estimated_time_minutes: Math.ceil(framesToGenerate.length * 2) // Rough estimate
    })

  } catch (error) {
    console.error("[API] Sprite sheet generation error:", error)
    
    return NextResponse.json(
      { 
        error: "Failed to start generation", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const spriteSheetId = searchParams.get('sprite_sheet_id')

    if (!spriteSheetId) {
      return NextResponse.json(
        { error: "sprite_sheet_id parameter required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get generation progress
    const { data: spriteSheet, error } = await supabase
      .from('sprite_sheets')
      .select('status, generation_progress')
      .eq('id', spriteSheetId)
      .eq('user_id', user.id)
      .single()

    if (error || !spriteSheet) {
      return NextResponse.json(
        { error: "Sprite sheet not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: spriteSheet.status,
      progress: spriteSheet.generation_progress
    })

  } catch (error) {
    console.error("[API] Get generation status error:", error)
    
    return NextResponse.json(
      { error: "Failed to get generation status" },
      { status: 500 }
    )
  }
}
