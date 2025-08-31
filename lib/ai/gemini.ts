import { GoogleGenerativeAI } from "@google/generative-ai"

export interface GenerationRequest {
  prompt: string
  styleReferenceUrl?: string
  parameters: {
    style?: string
    quality?: "standard" | "hd"
    size?: "1024x1024" | "1792x1024" | "1024x1792"
    batch_size?: number
  }
}

export interface GenerationResult {
  imageUrl: string
  metadata?: Record<string, any>
}

export async function generateAsset(request: GenerationRequest): Promise<GenerationResult> {
  try {
    console.log("[v0] Starting image generation with request:", request)

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["Text", "Image"],
      },
    })

    const imageGenerationPrompt = `
    Create a high-quality 2D game asset image: "${request.prompt}"
    
    Style: ${request.parameters.style || "realistic"}
    Quality: ${request.parameters.quality || "standard"}
    
    Requirements:
    - Professional game art quality
    - Clean, game-ready asset
    - Appropriate for indie game development
    - ${request.parameters.size || "1024x1024"} resolution
    - Optimized for game engines (Unity, Godot, etc.)
    
    Generate the actual image asset.
    `

    console.log("[v0] Generating image with Gemini 2.5 Flash...")

    const result = await model.generateContent(imageGenerationPrompt)

    let imageUrl = ""
    let enhancedPrompt = imageGenerationPrompt

    for (const part of result.response.candidates[0].content.parts) {
      if (part.text) {
        console.log("[v0] Gemini text response:", part.text)
        enhancedPrompt = part.text.trim()
      } else if (part.inlineData) {
        console.log("[v0] Received image data from Gemini")
        const imageData = part.inlineData.data

        // Convert base64 to data URL for immediate display
        const mimeType = part.inlineData.mimeType || "image/png"
        imageUrl = `data:${mimeType};base64,${imageData}`

        console.log("[v0] Generated image URL (base64):", imageUrl.substring(0, 100) + "...")
        break
      }
    }

    if (!imageUrl) {
      console.log("[v0] No image generated, using enhanced placeholder")
      imageUrl = `/placeholder.svg?height=1024&width=1024&query=${encodeURIComponent(enhancedPrompt)}`
    }

    const generationResult = {
      imageUrl,
      metadata: {
        prompt: request.prompt,
        enhancedPrompt,
        parameters: request.parameters,
        generatedAt: new Date().toISOString(),
        service: "gemini-2.5-flash-image",
        aiModel: "gemini-2.0-flash-exp",
      },
    }

    console.log("[v0] Generation completed successfully")
    return generationResult
  } catch (error) {
    console.error("[v0] Asset generation error:", error)

    const fallbackPrompt = `${request.prompt} in ${request.parameters.style || "realistic"} style. High quality game asset, clean background, professional game art style.`
    const fallbackUrl = `/placeholder.svg?height=1024&width=1024&query=${encodeURIComponent(fallbackPrompt)}`

    return {
      imageUrl: fallbackUrl,
      metadata: {
        prompt: request.prompt,
        enhancedPrompt: fallbackPrompt,
        parameters: request.parameters,
        generatedAt: new Date().toISOString(),
        service: "fallback-placeholder",
        error: "Gemini enhancement failed, using fallback",
      },
    }
  }
}
