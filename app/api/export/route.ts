import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import JSZip from "jszip"

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

    const { assetIds, format, includeMetadata, quality } = await request.json()

    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json({ error: "Asset IDs are required" }, { status: 400 })
    }

    // Get assets from database
    const { data: assets, error: assetsError } = await supabase
      .from("generated_assets")
      .select("*, asset_projects(name)")
      .in("id", assetIds)
      .eq("user_id", user.id)

    if (assetsError || !assets) {
      return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 })
    }

    if (format === "single" && assets.length === 1) {
      // Single asset download
      const asset = assets[0]
      const imageResponse = await fetch(asset.image_url)
      const imageBuffer = await imageResponse.arrayBuffer()

      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${sanitizeFilename(asset.prompt)}.png"`,
        },
      })
    }

    // Multiple assets - create ZIP
    const zip = new JSZip()
    const assetsFolder = zip.folder("assets")
    const metadataFolder = includeMetadata ? zip.folder("metadata") : null

    for (const asset of assets) {
      try {
        // Download image
        const imageResponse = await fetch(asset.image_url)
        const imageBuffer = await imageResponse.arrayBuffer()

        // Add image to ZIP
        const filename = `${sanitizeFilename(asset.prompt)}_${asset.id.slice(0, 8)}.png`
        assetsFolder?.file(filename, imageBuffer)

        // Add metadata if requested
        if (includeMetadata && metadataFolder) {
          const metadata = {
            id: asset.id,
            prompt: asset.prompt,
            project: asset.asset_projects?.name || "No project",
            parameters: asset.parameters,
            created_at: asset.created_at,
            status: asset.status,
          }
          metadataFolder.file(
            `${sanitizeFilename(asset.prompt)}_${asset.id.slice(0, 8)}.json`,
            JSON.stringify(metadata, null, 2),
          )
        }
      } catch (error) {
        console.error(`Failed to process asset ${asset.id}:`, error)
      }
    }

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: "arraybuffer" })

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="assets_export_${Date.now()}.zip"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 50)
}
