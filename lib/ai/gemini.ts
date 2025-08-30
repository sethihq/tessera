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
    // Build the prompt with style and parameters
    let enhancedPrompt = request.prompt

    if (request.parameters.style) {
      enhancedPrompt += ` in ${request.parameters.style} style`
    }

    enhancedPrompt += ". High quality game asset, clean background, professional game art style."

    // Call Gemini API for image generation
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a game asset image: ${enhancedPrompt}. Return the image as base64 data.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()

    // For now, since Gemini 2.0 Flash doesn't directly generate images,
    // we'll use a placeholder but with proper error handling
    // In production, you'd integrate with an actual image generation model
    const imageUrl = `/placeholder.svg?height=1024&width=1024&query=${encodeURIComponent(request.prompt)}`

    return {
      imageUrl,
      metadata: {
        prompt: request.prompt,
        enhancedPrompt,
        parameters: request.parameters,
        generatedAt: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Gemini generation error:", error)
    throw new Error("Failed to generate asset")
  }
}
