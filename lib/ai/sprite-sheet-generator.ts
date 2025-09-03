import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/lib/supabase/server"
import type { 
  SpriteSheet, 
  SpriteSheetFrame, 
  SpriteSheetFrameProperties,
  SpriteSheetBaseCharacter,
  WorldStyle 
} from "@/lib/types"

export interface SpriteSheetGenerationRequest {
  sprite_sheet: SpriteSheet
  frames_to_generate?: string[] // If only generating specific frames
  world_style?: WorldStyle
  priority?: "quality" | "speed"
  batch_size?: number // How many frames to generate in parallel
}

export interface SpriteSheetGenerationResult {
  success: boolean
  generated_frames: number
  failed_frames: number
  final_sprite_sheet_url?: string
  errors?: string[]
  metadata: {
    total_generation_time: number
    avg_time_per_frame: number
    consistency_score?: number
  }
}

/**
 * Generate a comprehensive prompt for a sprite sheet frame
 * Combines base character with frame-specific properties
 */
export function generateFramePrompt(
  baseCharacter: SpriteSheetBaseCharacter,
  frameProperties: SpriteSheetFrameProperties,
  worldStyle?: WorldStyle,
  framePosition?: { row: number; col: number }
): string {
  const { art_style, character_type, description, base_properties } = baseCharacter

  // Base character description
  let prompt = `Create a ${art_style} style ${character_type} character sprite: ${description}\n\n`

  // Character base properties
  prompt += `Base Character Properties:\n`
  if (base_properties.body_type) prompt += `- Body type: ${base_properties.body_type}\n`
  if (base_properties.skin_tone) prompt += `- Skin tone: ${base_properties.skin_tone}\n`
  if (base_properties.hair_color) prompt += `- Hair color: ${base_properties.hair_color}\n`
  if (base_properties.clothing_style) prompt += `- Clothing style: ${base_properties.clothing_style}\n`
  
  // Frame-specific modifications
  prompt += `\nFrame-Specific Properties:\n`
  if (frameProperties.emotion) prompt += `- Emotion: ${frameProperties.emotion}\n`
  if (frameProperties.expression) prompt += `- Facial expression: ${frameProperties.expression}\n`
  if (frameProperties.eye_state) prompt += `- Eye state: ${frameProperties.eye_state}\n`
  if (frameProperties.mouth_state) prompt += `- Mouth state: ${frameProperties.mouth_state}\n`
  
  if (frameProperties.clothing) prompt += `- Clothing: ${frameProperties.clothing}\n`
  if (frameProperties.outfit_variant) prompt += `- Outfit variant: ${frameProperties.outfit_variant}\n`
  if (frameProperties.hairstyle) prompt += `- Hairstyle: ${frameProperties.hairstyle}\n`
  
  if (frameProperties.action) prompt += `- Action: ${frameProperties.action}\n`
  if (frameProperties.pose) prompt += `- Pose: ${frameProperties.pose}\n`
  if (frameProperties.body_pose) prompt += `- Body pose: ${frameProperties.body_pose}\n`
  if (frameProperties.hand_position) prompt += `- Hand position: ${frameProperties.hand_position}\n`
  if (frameProperties.facing_direction) prompt += `- Facing direction: ${frameProperties.facing_direction}\n`
  if (frameProperties.leg_position) prompt += `- Leg position: ${frameProperties.leg_position}\n`

  // Accessories and effects
  if (frameProperties.accessories && frameProperties.accessories.length > 0) {
    prompt += `- Accessories: ${frameProperties.accessories.join(", ")}\n`
  }
  if (frameProperties.special_effects && frameProperties.special_effects.length > 0) {
    prompt += `- Special effects: ${frameProperties.special_effects.join(", ")}\n`
  }

  // Color variants
  if (frameProperties.color_variants) {
    const { skin_tone, hair_color, accent_color, eye_color } = frameProperties.color_variants
    if (skin_tone) prompt += `- Skin tone override: ${skin_tone}\n`
    if (hair_color) prompt += `- Hair color override: ${hair_color}\n`
    if (eye_color) prompt += `- Eye color: ${eye_color}\n`
    if (accent_color) prompt += `- Accent color: ${accent_color}\n`
  }

  // World style integration
  if (worldStyle) {
    prompt += `\nWorld Style Guidelines:\n`
    prompt += `- Style name: ${worldStyle.name}\n`
    if (worldStyle.description) prompt += `- Style description: ${worldStyle.description}\n`
    
    const { texture_style, line_weight, perspective, lighting, detail_level } = worldStyle.style_parameters
    if (texture_style) prompt += `- Texture style: ${texture_style}\n`
    if (line_weight) prompt += `- Line weight: ${line_weight}\n`
    if (perspective) prompt += `- Perspective: ${perspective}\n`
    if (lighting) prompt += `- Lighting: ${lighting}\n`
    if (detail_level) prompt += `- Detail level: ${detail_level}\n`

    // Color palette from world style
    if (worldStyle.extracted_palette) {
      const { primary, secondary, accent } = worldStyle.extracted_palette
      if (primary?.length) prompt += `- Primary colors: ${primary.join(", ")}\n`
      if (secondary?.length) prompt += `- Secondary colors: ${secondary.join(", ")}\n`
      if (accent?.length) prompt += `- Accent colors: ${accent.join(", ")}\n`
    }
  }

  // Generation requirements
  prompt += `\nGeneration Requirements:\n`
  prompt += `- CRITICAL: Transparent background (PNG format)\n`
  prompt += `- Game-ready sprite quality\n`
  prompt += `- Consistent art style with other frames\n`
  prompt += `- Clear, crisp edges suitable for scaling\n`
  prompt += `- Optimized for game engines (Unity, Godot, etc.)\n`
  prompt += `- Character should be centered in frame\n`
  prompt += `- Maintain character proportions and style consistency\n`

  // Frame position context (for animation continuity)
  if (framePosition) {
    prompt += `- Frame position in sprite sheet: Row ${framePosition.row + 1}, Column ${framePosition.col + 1}\n`
    prompt += `- Ensure visual continuity with adjacent frames\n`
  }

  // Custom modifiers
  if (frameProperties.custom_modifiers && frameProperties.custom_modifiers.length > 0) {
    prompt += `\nCustom Modifiers:\n`
    frameProperties.custom_modifiers.forEach(modifier => {
      prompt += `- ${modifier}\n`
    })
  }

  // Generation hints
  if (frameProperties.generation_hints) {
    const { consistency_priority, detail_level, style_emphasis } = frameProperties.generation_hints
    prompt += `\nGeneration Hints:\n`
    if (consistency_priority) prompt += `- Consistency priority: ${consistency_priority}\n`
    if (detail_level) prompt += `- Detail level: ${detail_level}\n`
    if (style_emphasis) prompt += `- Style emphasis: ${style_emphasis}\n`
  }

  prompt += `\nGenerate the character sprite image with these exact specifications.`

  return prompt
}

/**
 * Generate a single frame of a sprite sheet
 */
export async function generateSpriteSheetFrame(
  frame: SpriteSheetFrame,
  spriteSheet: SpriteSheet,
  worldStyle?: WorldStyle
): Promise<{ success: boolean; image_url?: string; error?: string; metadata?: any }> {
  try {
    console.log(`[SpriteSheet] Generating frame ${frame.position.row},${frame.position.col} with Gemini 2.0 Flash`)

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["Text", "Image"],
      },
    })

    // Generate comprehensive prompt
    const prompt = generateFramePrompt(
      spriteSheet.base_character,
      frame.properties,
      worldStyle,
      frame.position
    )

    console.log(`[SpriteSheet] Frame prompt generated:`, prompt.substring(0, 200) + "...")

    const result = await model.generateContent(prompt)
    
    for (const part of result.response.candidates[0].content.parts) {
      if (part.inlineData) {
        console.log(`[SpriteSheet] Received image data from Gemini for frame ${frame.position.row},${frame.position.col}`)
        
        const imageData = part.inlineData.data
        const mimeType = part.inlineData.mimeType || "image/png"

        // Upload to Supabase storage
        const supabase = await createClient()
        const imageBuffer = Buffer.from(imageData, "base64")
        
        const timestamp = Date.now()
        const frameId = `${frame.position.row}-${frame.position.col}`
        const fileName = `sprite-sheet-${spriteSheet.id}-frame-${frameId}-${timestamp}.png`
        const filePath = `sprite-sheets/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("generated-assets")
          .upload(filePath, imageBuffer, {
            contentType: "image/png",
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          console.error(`[SpriteSheet] Storage upload error for frame ${frameId}:`, uploadError)
          return { 
            success: false, 
            error: `Storage upload failed: ${uploadError.message}` 
          }
        }

        const { data: urlData } = supabase.storage
          .from("generated-assets")
          .getPublicUrl(filePath)

        return {
          success: true,
          image_url: urlData.publicUrl,
          metadata: {
            file_path: filePath,
            mime_type: mimeType,
            frame_position: frame.position,
            generation_time: Date.now() - timestamp
          }
        }
      }
    }

    return { success: false, error: "No image data received from AI model" }
    
  } catch (error) {
    console.error(`[SpriteSheet] Error generating frame:`, error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown generation error" 
    }
  }
}

/**
 * Generate multiple frames in parallel with rate limiting
 */
export async function generateSpriteSheetFrames(
  request: SpriteSheetGenerationRequest
): Promise<SpriteSheetGenerationResult> {
  const startTime = Date.now()
  const { sprite_sheet, frames_to_generate, world_style, batch_size = 3 } = request
  
  // Determine which frames to generate
  const framesToGenerate = frames_to_generate 
    ? sprite_sheet.frames.filter(frame => frames_to_generate.includes(frame.id))
    : sprite_sheet.frames.filter(frame => frame.status === 'pending')

  console.log(`[SpriteSheet] Generating ${framesToGenerate.length} frames for sprite sheet ${sprite_sheet.id}`)

  const results = {
    success: true,
    generated_frames: 0,
    failed_frames: 0,
    errors: [] as string[],
    metadata: {
      total_generation_time: 0,
      avg_time_per_frame: 0
    }
  }

  // Process frames in batches to avoid overwhelming the API
  for (let i = 0; i < framesToGenerate.length; i += batch_size) {
    const batch = framesToGenerate.slice(i, i + batch_size)
    
    const batchPromises = batch.map(async (frame) => {
      const frameResult = await generateSpriteSheetFrame(frame, sprite_sheet, world_style)
      
      if (frameResult.success) {
        results.generated_frames++
        
        // Update frame in database
        const supabase = await createClient()
        await supabase
          .from('sprite_sheet_frames')
          .update({
            image_url: frameResult.image_url,
            status: 'completed',
            generation_metadata: frameResult.metadata
          })
          .eq('id', frame.id)
          
      } else {
        results.failed_frames++
        results.errors?.push(`Frame ${frame.position.row},${frame.position.col}: ${frameResult.error}`)
        
        // Update frame status to error
        const supabase = await createClient()
        await supabase
          .from('sprite_sheet_frames')
          .update({
            status: 'error',
            error_message: frameResult.error
          })
          .eq('id', frame.id)
      }
      
      return frameResult
    })

    // Wait for current batch to complete before processing next batch
    await Promise.all(batchPromises)
    
    // Small delay between batches to respect rate limits
    if (i + batch_size < framesToGenerate.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const totalTime = Date.now() - startTime
  results.metadata.total_generation_time = totalTime
  results.metadata.avg_time_per_frame = totalTime / Math.max(results.generated_frames, 1)

  // If all frames are generated, create final sprite sheet composite
  if (results.failed_frames === 0 && results.generated_frames === framesToGenerate.length) {
    try {
      const final_url = await createSpriteSheetComposite(sprite_sheet)
      if (final_url) {
        // Update sprite sheet status
        const supabase = await createClient()
        await supabase
          .from('sprite_sheets')
          .update({
            status: 'completed',
            final_image_url: final_url,
            generation_progress: {
              completed_frames: results.generated_frames,
              total_frames: sprite_sheet.frames.length
            }
          })
          .eq('id', sprite_sheet.id)
          
        return { ...results, final_sprite_sheet_url: final_url }
      }
    } catch (compositeError) {
      console.error('[SpriteSheet] Error creating composite:', compositeError)
      results.errors?.push(`Failed to create final sprite sheet: ${compositeError}`)
    }
  }

  return results
}

/**
 * Create a composite sprite sheet image from individual frames
 * This combines all generated frames into a single sprite sheet PNG
 */
export async function createSpriteSheetComposite(
  spriteSheet: SpriteSheet
): Promise<string | null> {
  try {
    console.log(`[SpriteSheet] Creating composite for sprite sheet ${spriteSheet.id}`)
    
    // For now, return a placeholder implementation
    // In a real implementation, you would:
    // 1. Download all individual frame images
    // 2. Create a canvas with proper dimensions
    // 3. Composite all frames with correct spacing
    // 4. Upload the final sprite sheet
    
    // TODO: Implement image compositing using Canvas API or similar
    console.log('[SpriteSheet] Composite creation not yet implemented')
    return null
    
  } catch (error) {
    console.error('[SpriteSheet] Error creating composite:', error)
    throw error
  }
}

/**
 * Validate sprite sheet configuration before generation
 */
export function validateSpriteSheetConfiguration(spriteSheet: SpriteSheet): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check basic configuration
  if (!spriteSheet.base_character.description) {
    errors.push("Base character description is required")
  }

  if (spriteSheet.dimensions.rows < 1 || spriteSheet.dimensions.cols < 1) {
    errors.push("Sprite sheet dimensions must be at least 1x1")
  }

  if (spriteSheet.dimensions.rows > 20 || spriteSheet.dimensions.cols > 20) {
    errors.push("Sprite sheet dimensions cannot exceed 20x20 (400 frames)")
  }

  if (spriteSheet.frame_size.width < 16 || spriteSheet.frame_size.height < 16) {
    errors.push("Frame size must be at least 16x16 pixels")
  }

  if (spriteSheet.frame_size.width > 512 || spriteSheet.frame_size.height > 512) {
    errors.push("Frame size cannot exceed 512x512 pixels")
  }

  // Check frames
  const expectedFrames = spriteSheet.dimensions.rows * spriteSheet.dimensions.cols
  if (spriteSheet.frames.length !== expectedFrames) {
    errors.push(`Expected ${expectedFrames} frames but found ${spriteSheet.frames.length}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
