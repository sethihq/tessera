"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  Package,
  CheckCircle,
  AlertCircle,
  Loader2,
  Infinity as Unity,
  Gamepad2,
  Grid3X3,
} from "lucide-react"
import type { GeneratedAsset } from "@/lib/types"

interface ExportManagerProps {
  selectedAssets: GeneratedAsset[]
  onExportComplete?: (result: any) => void
}

export function ExportManager({ selectedAssets, onExportComplete }: ExportManagerProps) {
  const [exportFormat, setExportFormat] = useState("png")
  const [gameEngine, setGameEngine] = useState("unity")
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [batchExport, setBatchExport] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportStatus, setExportStatus] = useState<"idle" | "preparing" | "exporting" | "complete" | "error">("idle")

  const gameEngines = [
    { id: "unity", name: "Unity", icon: Unity, description: "Unity 2021.3+ with sprites, tilemaps, and prefabs" },
    { id: "godot", name: "Godot", icon: Gamepad2, description: "Godot 4.0+ with scenes, resources, and imports" },
    { id: "phaser", name: "Phaser", icon: Gamepad2, description: "Phaser 3.x with atlases and tilemaps" },
    { id: "tiled", name: "Tiled", icon: Grid3X3, description: "Tiled Map Editor with TSX/TMX files" },
    { id: "generic", name: "Generic", icon: Package, description: "Standard PNG/JSON format" },
  ]

  const exportFormats = [
    { id: "png", name: "PNG Images", description: "Standard PNG format with optional metadata" },
    { id: "sprite_atlas", name: "Sprite Atlas", description: "Combined sprite sheet with JSON data" },
    { id: "aseprite", name: "Aseprite", description: "Aseprite format with animation data" },
    { id: "unity_sprite", name: "Unity Sprite", description: "Unity-ready sprites with .meta files" },
    { id: "godot_texture", name: "Godot Texture", description: "Godot textures with .import files" },
    { id: "tiled_tileset", name: "Tiled Tileset", description: "Tiled TSX/TMX format with collision data" },
  ]

  const handleExport = async () => {
    if (selectedAssets.length === 0) return

    setIsExporting(true)
    setExportStatus("preparing")
    setExportProgress(0)

    try {
      // Simulate preparation phase
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setExportStatus("exporting")
      setExportProgress(25)

      const exportData = {
        assetIds: selectedAssets.map((asset) => asset.id),
        format: selectedAssets.length === 1 && !batchExport ? "single" : "batch",
        exportFormat,
        gameEngine,
        includeMetadata,
        quality: "high",
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 15, 90))
      }, 500)

      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportData),
      })

      clearInterval(progressInterval)
      setExportProgress(100)

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      // Handle file download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url

      // Get filename from response headers
      const contentDisposition = response.headers.get("content-disposition")
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `export_${Date.now()}.zip`

      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setExportStatus("complete")
      onExportComplete?.(exportData)

      // Reset after delay
      setTimeout(() => {
        setExportStatus("idle")
        setExportProgress(0)
      }, 3000)
    } catch (error) {
      console.error("Export error:", error)
      setExportStatus("error")
    } finally {
      setIsExporting(false)
    }
  }

  const getCompatibleFormats = () => {
    if (selectedAssets.length === 0) return exportFormats

    // Filter formats based on selected assets' types
    const assetTypes = [...new Set(selectedAssets.map((asset) => asset.asset_type_id))]

    return exportFormats.filter((format) => {
      switch (format.id) {
        case "tiled_tileset":
          return selectedAssets.some((asset) => asset.parameters?.tile_size)
        case "sprite_atlas":
          return selectedAssets.some((asset) => asset.parameters?.sprite_sheet)
        default:
          return true
      }
    })
  }

  const getExportPreview = () => {
    if (selectedAssets.length === 0) return null

    const assetTypes = selectedAssets.reduce(
      (acc, asset) => {
        const type = asset.parameters?.asset_type || "props"
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Export Preview</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-neutral-600 dark:text-neutral-400">Assets:</span>
            <span className="ml-2 font-medium">{selectedAssets.length}</span>
          </div>
          <div>
            <span className="text-neutral-600 dark:text-neutral-400">Format:</span>
            <span className="ml-2 font-medium">{exportFormats.find((f) => f.id === exportFormat)?.name}</span>
          </div>
          <div>
            <span className="text-neutral-600 dark:text-neutral-400">Engine:</span>
            <span className="ml-2 font-medium">{gameEngines.find((e) => e.id === gameEngine)?.name}</span>
          </div>
          <div>
            <span className="text-neutral-600 dark:text-neutral-400">Metadata:</span>
            <span className="ml-2 font-medium">{includeMetadata ? "Included" : "Excluded"}</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Asset Types:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(assetTypes).map(([type, count]) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-[#FF6600]" />
          Export Assets
        </CardTitle>
        <CardDescription>Export your assets in game-engine ready formats with proper metadata</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Game Engine Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Target Game Engine</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {gameEngines.map((engine) => (
                  <Card
                    key={engine.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      gameEngine === engine.id
                        ? "border-[#FF6600] bg-[#FF6600]/5"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-[#FF6600]/50"
                    }`}
                    onClick={() => setGameEngine(engine.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            gameEngine === engine.id
                              ? "bg-[#FF6600] text-white"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                          }`}
                        >
                          <engine.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900 dark:text-neutral-100">{engine.name}</h4>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{engine.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div className="space-y-3">
              <Label htmlFor="exportFormat" className="text-base font-medium">
                Export Format
              </Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent>
                  {getCompatibleFormats().map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      <div className="flex flex-col">
                        <span>{format.name}</span>
                        <span className="text-xs text-neutral-500">{format.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Export Options */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Export Options</Label>

              <div className="flex items-center space-x-2">
                <Checkbox id="includeMetadata" checked={includeMetadata} onCheckedChange={setIncludeMetadata} />
                <Label htmlFor="includeMetadata" className="text-sm">
                  Include metadata and configuration files
                </Label>
              </div>

              {selectedAssets.length > 1 && (
                <div className="flex items-center space-x-2">
                  <Checkbox id="batchExport" checked={batchExport} onCheckedChange={setBatchExport} />
                  <Label htmlFor="batchExport" className="text-sm">
                    Export as organized asset pack
                  </Label>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6 mt-6">
            {selectedAssets.length > 0 ? (
              <>
                {getExportPreview()}

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Selected Assets</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {selectedAssets.slice(0, 8).map((asset) => (
                      <div key={asset.id} className="relative">
                        <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                          <img
                            src={asset.image_url || "/placeholder.svg"}
                            alt={asset.prompt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 truncate">{asset.prompt}</p>
                      </div>
                    ))}
                    {selectedAssets.length > 8 && (
                      <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          +{selectedAssets.length - 8} more
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">No Assets Selected</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Select assets from your library to see export preview
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Quality Settings</h4>

              <div className="space-y-3">
                <Label>Compression Quality</Label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lossless">Lossless (Largest)</SelectItem>
                    <SelectItem value="high">High Quality</SelectItem>
                    <SelectItem value="medium">Medium Quality</SelectItem>
                    <SelectItem value="low">Low Quality (Smallest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Color Depth</Label>
                <Select defaultValue="32bit">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="32bit">32-bit RGBA</SelectItem>
                    <SelectItem value="24bit">24-bit RGB</SelectItem>
                    <SelectItem value="8bit">8-bit Indexed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Batch Processing</h4>

              <div className="flex items-center space-x-2">
                <Checkbox id="generateThumbnails" />
                <Label htmlFor="generateThumbnails" className="text-sm">
                  Generate thumbnails (256x256)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="validateAssets" defaultChecked />
                <Label htmlFor="validateAssets" className="text-sm">
                  Validate asset integrity
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="optimizeFileSize" />
                <Label htmlFor="optimizeFileSize" className="text-sm">
                  Optimize file sizes
                </Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Progress */}
        {exportStatus !== "idle" && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              {exportStatus === "preparing" && <Loader2 className="w-4 h-4 animate-spin text-[#FF6600]" />}
              {exportStatus === "exporting" && <Loader2 className="w-4 h-4 animate-spin text-[#FF6600]" />}
              {exportStatus === "complete" && <CheckCircle className="w-4 h-4 text-green-500" />}
              {exportStatus === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}

              <span className="text-sm font-medium">
                {exportStatus === "preparing" && "Preparing export..."}
                {exportStatus === "exporting" && "Exporting assets..."}
                {exportStatus === "complete" && "Export completed successfully!"}
                {exportStatus === "error" && "Export failed. Please try again."}
              </span>
            </div>

            <Progress value={exportProgress} className="w-full" />
          </div>
        )}

        {/* Export Button */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {selectedAssets.length} asset{selectedAssets.length !== 1 ? "s" : ""} selected
          </div>

          <Button
            onClick={handleExport}
            disabled={selectedAssets.length === 0 || isExporting}
            className="bg-[#FF6600] hover:bg-[#E55A00] text-white"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {selectedAssets.length > 1 ? "Assets" : "Asset"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
