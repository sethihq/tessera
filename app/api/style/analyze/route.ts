import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    console.log("[Style Analysis] API called")

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    try {
      // Fetch image data
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image')
      }
      
      const imageBuffer = await imageResponse.arrayBuffer()
      const imageBase64 = Buffer.from(imageBuffer).toString('base64')
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

      const prompt = `Analyze this image and extract detailed style information for game asset generation.

Return a JSON response with the following structure:
{
  "mood": "descriptive mood (e.g., dark, mystical, cheerful, dramatic)",
  "lighting": "lighting style (e.g., soft, harsh, dramatic, ambient, natural)",
  "texture_style": "texture characteristics (e.g., smooth, rough, detailed, minimalist)",
  "art_style": "art style classification (e.g., realistic, cartoon, pixel-art, fantasy, sci-fi)",
  "color_scheme": "dominant color scheme (e.g., warm, cool, monochromatic, vibrant)",
  "composition": "composition style (e.g., symmetrical, dynamic, minimalist, complex)",
  "detail_level": "level of detail (e.g., high, medium, low, stylized)",
  "environment_type": "if applicable (e.g., indoor, outdoor, abstract, architectural)",
  "suggested_prompts": ["array of 3-5 descriptive phrases that capture the style"]
}

Focus on characteristics that would be useful for maintaining visual consistency in game asset generation.`

      const result = await model.generateContent([
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        },
        prompt
      ])

      const response = await result.response
      const text = response.text()
      
      // Parse JSON response
      let styleMetadata
      try {
        // Clean the response text and extract JSON
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```/g, '').trim()
        styleMetadata = JSON.parse(cleanedText)
      } catch (parseError) {
        console.error('[Style Analysis] JSON parse error:', parseError)
        // Fallback to basic analysis
        styleMetadata = {
          mood: "neutral",
          lighting: "natural",
          texture_style: "detailed",
          art_style: "realistic",
          color_scheme: "balanced",
          composition: "standard",
          detail_level: "medium",
          environment_type: "general",
          suggested_prompts: ["high quality", "detailed", "game asset"]
        }
      }

      console.log("[Style Analysis] Analysis completed successfully")

      return NextResponse.json({
        success: true,
        styleMetadata
      })

    } catch (aiError) {
      console.error('[Style Analysis] AI analysis error:', aiError)
      
      // Return basic fallback analysis
      return NextResponse.json({
        success: true,
        styleMetadata: {
          mood: "neutral",
          lighting: "natural", 
          texture_style: "detailed",
          art_style: "realistic",
          color_scheme: "balanced",
          composition: "standard",
          detail_level: "medium",
          environment_type: "general",
          suggested_prompts: ["high quality", "detailed", "game asset"]
        }
      })
    }

  } catch (error) {
    console.error("[Style Analysis] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
