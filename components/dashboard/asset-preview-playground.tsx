"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  ZoomInIcon,
  ZoomOutIcon,
  GridIcon,
  LayersIcon,
  PackageIcon,
  GenerateIcon,
  EyeIcon,
  SettingsIcon,
  DownloadIcon,
  Maximize2Icon,
} from "@/components/rounded-icons/icons"
import type { GeneratedAsset, AssetType } from "@/lib/types"

interface AssetPreviewPlaygroundProps {
  asset: GeneratedAsset
  assetType: AssetType
  onParameterChange?: (parameters: any) => void
  onRegenerate?: () => void
}

export function AssetPreviewPlayground({
  asset,
  assetType,
  onParameterChange,
  onRegenerate,
}: AssetPreviewPlaygroundProps) {
  const [previewMode, setPreviewMode] = useState("context")
  const [isPlaying, setIsPlaying] = useState(true)
  const [zoom, setZoom] = useState(100)
  const [scrollSpeed, setScrollSpeed] = useState(1)
  const [tileRepeat, setTileRepeat] = useState(4)
  const [showGrid, setShowGrid] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const scrollOffsetRef = useRef(0)

  useEffect(() => {
    if (assetType.name === "parallax" && isPlaying) {
      startParallaxAnimation()
    } else if (assetType.name === "fx" && isPlaying) {
      startFXAnimation()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, scrollSpeed, assetType.name])

  const startParallaxAnimation = () => {
    const animate = () => {
      scrollOffsetRef.current += scrollSpeed * 0.5
      drawParallaxPreview()
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()
  }

  const startFXAnimation = () => {
    let frameIndex = 0
    const frameCount = asset.export_data?.animation_frames || 8

    const animate = () => {
      drawFXPreview(frameIndex)
      frameIndex = (frameIndex + 1) % frameCount

      setTimeout(
        () => {
          if (isPlaying) {
            animationRef.current = requestAnimationFrame(animate)
          }
        },
        1000 / (asset.parameters?.frame_rate || 12),
      )
    }
    animate()
  }

  const drawParallaxPreview = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Simulate multiple parallax layers
    const layers = asset.parameters?.layers || 3
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = asset.image_url || ""

    img.onload = () => {
      for (let i = 0; i < layers; i++) {
        const depth = (i + 1) / layers
        const offset = (scrollOffsetRef.current * depth) % width

        ctx.globalAlpha = 0.8 - i * 0.2
        ctx.drawImage(img, -offset, 0, width, height)
        ctx.drawImage(img, width - offset, 0, width, height)
      }
      ctx.globalAlpha = 1
    }
  }

  const drawTilesetPreview = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = asset.image_url || ""

    img.onload = () => {
      const tileSize = 64 // Base tile size for preview
      const cols = Math.ceil(width / tileSize)
      const rows = Math.ceil(height / tileSize)

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          ctx.drawImage(img, col * tileSize, row * tileSize, tileSize, tileSize)
        }
      }

      // Draw grid if enabled
      if (showGrid) {
        ctx.strokeStyle = "#FF6600"
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.5

        for (let i = 0; i <= cols; i++) {
          ctx.beginPath()
          ctx.moveTo(i * tileSize, 0)
          ctx.lineTo(i * tileSize, height)
          ctx.stroke()
        }

        for (let i = 0; i <= rows; i++) {
          ctx.beginPath()
          ctx.moveTo(0, i * tileSize)
          ctx.lineTo(width, i * tileSize)
          ctx.stroke()
        }

        ctx.globalAlpha = 1
      }
    }
  }

  const drawFXPreview = (frameIndex: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Simulate frame animation by varying opacity/scale
    const scale = 0.8 + Math.sin(frameIndex * 0.5) * 0.2
    const opacity = 0.7 + Math.sin(frameIndex * 0.3) * 0.3

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = asset.image_url || ""

    img.onload = () => {
      const centerX = width / 2
      const centerY = height / 2
      const drawWidth = img.width * scale * (zoom / 100)
      const drawHeight = img.height * scale * (zoom / 100)

      ctx.globalAlpha = opacity
      ctx.drawImage(img, centerX - drawWidth / 2, centerY - drawHeight / 2, drawWidth, drawHeight)
      ctx.globalAlpha = 1
    }
  }

  const drawPropsPreview = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = asset.image_url || ""

    img.onload = () => {
      const centerX = width / 2
      const centerY = height / 2
      const drawWidth = img.width * (zoom / 100)
      const drawHeight = img.height * (zoom / 100)

      // Draw multiple variations if specified
      const variations = asset.parameters?.variations || 1
      const spacing = Math.min(width, height) / (variations + 1)

      for (let i = 0; i < variations; i++) {
        const x = centerX + (i - (variations - 1) / 2) * spacing
        const rotation = i * 0.2 // Slight rotation for variety

        ctx.save()
        ctx.translate(x, centerY)
        ctx.rotate(rotation)
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
        ctx.restore()
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Draw based on asset type
    switch (assetType.name) {
      case "parallax":
        if (!isPlaying) drawParallaxPreview()
        break
      case "tileset":
        drawTilesetPreview()
        break
      case "props":
        drawPropsPreview()
        break
      case "fx":
        if (!isPlaying) drawFXPreview(0)
        break
    }
  }, [zoom, tileRepeat, showGrid, backgroundColor, asset.image_url])

  const getPreviewIcon = () => {
    switch (assetType.name) {
      case "parallax":
        return <LayersIcon className="w-4 h-4" />
      case "tileset":
        return <GridIcon className="w-4 h-4" />
      case "props":
        return <PackageIcon className="w-4 h-4" />
      case "fx":
        return <GenerateIcon className="w-4 h-4" />
      default:
        return <EyeIcon className="w-4 h-4" />
    }
  }

  const resetPreview = () => {
    scrollOffsetRef.current = 0
    setZoom(100)
    setScrollSpeed(1)
    setIsPlaying(true)
  }

  return (
    <div className="space-y-6">
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getPreviewIcon()}
            Asset Preview - {assetType.display_name}
          </CardTitle>
          <CardDescription>Interactive preview showing how your asset works in context</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={previewMode} onValueChange={setPreviewMode} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="context">In Context</TabsTrigger>
              <TabsTrigger value="isolated">Isolated</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
            </TabsList>

            <TabsContent value="context" className="space-y-4">
              {/* Main Preview Canvas */}
              <div className="relative bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-[600px] object-contain"
                  style={{ backgroundColor }}
                />

                {/* Preview Controls Overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-white/90 dark:bg-neutral-800/90"
                  >
                    {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetPreview}
                    className="bg-white/90 dark:bg-neutral-800/90"
                  >
                    <RotateCcwIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-white/90 dark:bg-neutral-800/90">
                    <Maximize2Icon className="w-4 h-4" />
                  </Button>
                </div>

                {/* Asset Type Specific Info */}
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 dark:bg-neutral-800/90">
                    {assetType.name === "parallax" && `${asset.parameters?.layers || 3} LayersIcon`}
                    {assetType.name === "tileset" && `${asset.parameters?.tile_size || "32x32"} Tiles`}
                    {assetType.name === "props" && `${asset.parameters?.variations || 1} Variations`}
                    {assetType.name === "fx" && `${asset.parameters?.frame_count || 8} Frames`}
                  </Badge>
                </div>
              </div>

              {/* Context-Specific Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Zoom Control */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ZoomInIcon className="w-4 h-4" />
                    Zoom: {zoom}%
                  </Label>
                  <Slider
                    value={[zoom]}
                    onValueChange={([value]) => setZoom(value)}
                    min={25}
                    max={400}
                    step={25}
                    className="w-full"
                  />
                </div>

                {/* Asset Type Specific Controls */}
                {assetType.name === "parallax" && (
                  <div className="space-y-2">
                    <Label>Scroll Speed: {scrollSpeed}x</Label>
                    <Slider
                      value={[scrollSpeed]}
                      onValueChange={([value]) => setScrollSpeed(value)}
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                )}

                {assetType.name === "tileset" && (
                  <>
                    <div className="space-y-2">
                      <Label>
                        Tile Repeat: {tileRepeat}x{tileRepeat}
                      </Label>
                      <Slider
                        value={[tileRepeat]}
                        onValueChange={([value]) => setTileRepeat(value)}
                        min={2}
                        max={8}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="showGrid" checked={showGrid} onCheckedChange={setShowGrid} />
                      <Label htmlFor="showGrid">Show Grid</Label>
                    </div>
                  </>
                )}

                {/* Background Color */}
                <div className="space-y-2">
                  <Label>Background</Label>
                  <Select value={backgroundColor} onValueChange={setBackgroundColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#1a1a1a">Dark</SelectItem>
                      <SelectItem value="#ffffff">Light</SelectItem>
                      <SelectItem value="#0f172a">Midnight</SelectItem>
                      <SelectItem value="#065f46">Forest</SelectItem>
                      <SelectItem value="#7c2d12">Desert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="isolated" className="space-y-4">
              <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                <img
                  src={asset.image_url || "/placeholder.svg"}
                  alt={asset.prompt}
                  className="max-w-full max-h-full object-contain"
                  style={{ transform: `scale(${zoom / 100})` }}
                />
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(25, zoom - 25))}>
                  <ZoomOutIcon className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(400, zoom + 25))}>
                  <ZoomInIcon className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Asset Information */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-base">Asset Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Type:</span>
                      <Badge variant="secondary">{assetType.display_name}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Status:</span>
                      <Badge variant={asset.status === "completed" ? "default" : "secondary"}>{asset.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Created:</span>
                      <span className="text-sm">{new Date(asset.created_at).toLocaleDateString()}</span>
                    </div>
                    {asset.parameters?.size && (
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Resolution:</span>
                        <span className="text-sm">{asset.parameters.size}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Export Formats */}
                <Card className="border-neutral-200 dark:border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-base">Export Formats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {assetType.export_formats?.map((format) => (
                        <Badge key={format} variant="outline" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Parameters */}
                <Card className="border-neutral-200 dark:border-neutral-800 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Generation Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {Object.entries(asset.parameters || {}).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-neutral-600 dark:text-neutral-400 capitalize">
                            {key.replace(/_/g, " ")}:
                          </span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <DownloadIcon className="w-4 h-4 mr-2" />
                DownloadIcon
              </Button>
              <Button variant="outline" size="sm">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Adjust Parameters
              </Button>
            </div>

            {onRegenerate && (
              <Button onClick={onRegenerate} className="bg-[#FF6600] hover:bg-[#E55A00] text-white">
                <RotateCcwIcon className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
