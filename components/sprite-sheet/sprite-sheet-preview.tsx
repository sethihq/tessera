"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/origin-ui/card"
import { Button } from "@/components/luxe-ui/button"
import { Badge } from "@/components/luxe-ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/origin-ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/origin-ui/select"
import { Input } from "@/components/origin-ui/input"
import { Label } from "@/components/origin-ui/label"
import { Switch } from "@/components/luxe-ui/switch"
import { Slider } from "@/components/luxe-ui/slider"
import { 
  EyeIcon, 
  DownloadIcon, 
  PlayIcon, 
  PauseIcon,
  SettingsIcon,
  GridIcon,
  PackageIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from "@/components/rounded-icons/icons"
import type { SpriteSheet, SpriteSheetExportOptions } from "@/lib/types"

interface SpriteSheetPreviewProps {
  spriteSheet: SpriteSheet
  onExport?: (options: SpriteSheetExportOptions) => void
}

export function SpriteSheetPreview({ spriteSheet, onExport }: SpriteSheetPreviewProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(500) // ms per frame
  const [currentFrame, setCurrentFrame] = useState(0)
  const [exportOptions, setExportOptions] = useState<SpriteSheetExportOptions>({
    format: "png",
    include_metadata: true,
    include_individual_frames: false,
    game_engine_preset: "unity"
  })

  // Filter completed frames for animation
  const completedFrames = spriteSheet.frames
    .filter(frame => frame.status === "completed" && frame.image_url)
    .sort((a, b) => {
      if (a.position.row !== b.position.row) {
        return a.position.row - b.position.row
      }
      return a.position.col - b.position.col
    })

  // Animation logic
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  // Calculate completion stats
  const stats = {
    total: spriteSheet.frames.length,
    completed: spriteSheet.frames.filter(f => f.status === "completed").length,
    generating: spriteSheet.frames.filter(f => f.status === "generating").length,
    error: spriteSheet.frames.filter(f => f.status === "error").length,
    pending: spriteSheet.frames.filter(f => f.status === "pending").length
  }

  const completionPercentage = (stats.completed / stats.total) * 100

  // Handle export
  const handleExport = () => {
    onExport?.(exportOptions)
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GridIcon className="w-5 h-5" />
            {spriteSheet.name}
          </CardTitle>
          <CardDescription>
            {spriteSheet.description || "Sprite sheet preview and export options"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {stats.completed}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Completed
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {stats.generating}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Generating
              </div>
            </div>
            <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
              <div className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">
                {stats.pending}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Pending
              </div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {stats.error}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                Errors
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Progress: {Math.round(completionPercentage)}%
              </span>
              <Badge variant={spriteSheet.status === "completed" ? "elevated" : "muted"}>
                {spriteSheet.status}
              </Badge>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="animation">Animation</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EyeIcon className="w-4 h-4" />
                Sprite Sheet Grid
              </CardTitle>
            </CardHeader>
            <CardContent>
              {spriteSheet.final_image_url ? (
                <div className="space-y-4">
                  <div className="max-w-full overflow-auto">
                    <img
                      src={spriteSheet.final_image_url}
                      alt={spriteSheet.name}
                      className="max-w-full h-auto border rounded bg-transparent"
                      style={{
                        imageRendering: spriteSheet.base_character.art_style === "pixel" ? "pixelated" : "auto"
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                    <div>
                      <strong>Dimensions:</strong> {spriteSheet.dimensions.rows} × {spriteSheet.dimensions.cols}
                    </div>
                    <div>
                      <strong>Frame Size:</strong> {spriteSheet.frame_size.width} × {spriteSheet.frame_size.height}px
                    </div>
                    <div>
                      <strong>Total Frames:</strong> {spriteSheet.frames.length}
                    </div>
                    <div>
                      <strong>Art Style:</strong> {spriteSheet.base_character.art_style}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div 
                    className="grid gap-2 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg max-w-2xl mx-auto"
                    style={{
                      gridTemplateColumns: `repeat(${spriteSheet.dimensions.cols}, 1fr)`,
                      aspectRatio: `${spriteSheet.dimensions.cols} / ${spriteSheet.dimensions.rows}`
                    }}
                  >
                    {spriteSheet.frames.sort((a, b) => {
                      if (a.position.row !== b.position.row) return a.position.row - b.position.row
                      return a.position.col - b.position.col
                    }).map((frame) => (
                      <div
                        key={frame.id}
                        className="relative aspect-square border border-neutral-300 dark:border-neutral-600 rounded overflow-hidden"
                      >
                        {frame.image_url ? (
                          <img
                            src={frame.image_url}
                            alt={`Frame ${frame.position.row},${frame.position.col}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                            {frame.status === "generating" ? (
                              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                            ) : frame.status === "error" ? (
                              <AlertCircleIcon className="w-4 h-4 text-red-500" />
                            ) : (
                              <div className="w-4 h-4 bg-neutral-300 dark:bg-neutral-600 rounded" />
                            )}
                          </div>
                        )}
                        
                        {/* Status indicator */}
                        <div className="absolute top-1 right-1">
                          {frame.status === "completed" && (
                            <CheckCircleIcon className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center text-sm text-neutral-500">
                    {stats.completed < stats.total ? (
                      `Preview will be available when all frames are generated (${stats.completed}/${stats.total})`
                    ) : (
                      "Final sprite sheet is being compiled..."
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animation Tab */}
        <TabsContent value="animation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayIcon className="w-4 h-4" />
                Animation Preview
              </CardTitle>
              <CardDescription>
                Preview your sprite sheet as an animation sequence
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedFrames.length > 0 ? (
                <div className="space-y-4">
                  {/* Animation Controls */}
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={toggleAnimation}
                      variant="elevated"
                      className="flex items-center gap-2"
                    >
                      {isAnimating ? (
                        <>
                          <PauseIcon className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-4 h-4" />
                          Play
                        </>
                      )}
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Speed:</Label>
                      <div className="w-32">
                        <Slider
                          value={[animationSpeed]}
                          onValueChange={([value]) => setAnimationSpeed(value)}
                          min={100}
                          max={2000}
                          step={100}
                        />
                      </div>
                      <span className="text-sm text-neutral-500">
                        {animationSpeed}ms
                      </span>
                    </div>
                  </div>

                  {/* Animation Preview */}
                  <div className="flex justify-center">
                    <div 
                      className="border border-neutral-300 dark:border-neutral-600 rounded p-4 bg-neutral-50 dark:bg-neutral-900"
                      style={{
                        width: Math.max(spriteSheet.frame_size.width * 2, 128),
                        height: Math.max(spriteSheet.frame_size.height * 2, 128)
                      }}
                    >
                      {completedFrames[currentFrame] && (
                        <img
                          src={completedFrames[currentFrame].image_url!}
                          alt={`Animation frame ${currentFrame + 1}`}
                          className="w-full h-full object-contain"
                          style={{
                            imageRendering: spriteSheet.base_character.art_style === "pixel" ? "pixelated" : "auto"
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Frame indicator */}
                  <div className="text-center text-sm text-neutral-500">
                    Frame {currentFrame + 1} of {completedFrames.length}
                  </div>

                  {/* Frame thumbnails */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {completedFrames.map((frame, index) => (
                      <button
                        key={frame.id}
                        onClick={() => setCurrentFrame(index)}
                        className={`flex-shrink-0 w-16 h-16 border-2 rounded overflow-hidden ${
                          currentFrame === index 
                            ? "border-neutral-900 dark:border-neutral-100" 
                            : "border-neutral-300 dark:border-neutral-600"
                        }`}
                      >
                        <img
                          src={frame.image_url!}
                          alt={`Frame ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <PlayIcon className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                    No frames available
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Generate some frames to preview the animation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DownloadIcon className="w-4 h-4" />
                Export Options
              </CardTitle>
              <CardDescription>
                Configure export settings for your sprite sheet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Export Format</Label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG Sprite Sheet</SelectItem>
                      <SelectItem value="webp">WebP Sprite Sheet</SelectItem>
                      <SelectItem value="gif">Animated GIF</SelectItem>
                      <SelectItem value="sprite_atlas">Sprite Atlas (JSON)</SelectItem>
                      <SelectItem value="json">JSON Metadata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Game Engine Preset</Label>
                  <Select
                    value={exportOptions.game_engine_preset}
                    onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, game_engine_preset: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unity">Unity</SelectItem>
                      <SelectItem value="godot">Godot</SelectItem>
                      <SelectItem value="phaser">Phaser</SelectItem>
                      <SelectItem value="gamemaker">GameMaker</SelectItem>
                      <SelectItem value="aseprite">Aseprite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Include Metadata</Label>
                  <Switch
                    checked={exportOptions.include_metadata}
                    onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, include_metadata: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Include Individual Frames</Label>
                  <Switch
                    checked={exportOptions.include_individual_frames}
                    onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, include_individual_frames: checked }))}
                  />
                </div>
              </div>

              {exportOptions.format === "sprite_atlas" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Custom Spacing (px)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={exportOptions.custom_spacing || spriteSheet.output_settings.spacing}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        custom_spacing: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Frame Width Override</Label>
                    <Input
                      type="number"
                      min="16"
                      max="512"
                      placeholder={spriteSheet.frame_size.width.toString()}
                      onChange={(e) => {
                        const width = parseInt(e.target.value)
                        if (width) {
                          setExportOptions(prev => ({ 
                            ...prev, 
                            custom_frame_size: { 
                              width, 
                              height: prev.custom_frame_size?.height || spriteSheet.frame_size.height 
                            } 
                          }))
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  onClick={handleExport}
                  disabled={stats.completed === 0}
                  className="w-full flex items-center gap-2"
                  variant="elevated"
                >
                  <PackageIcon className="w-4 h-4" />
                  Export Sprite Sheet
                </Button>
                
                {stats.completed === 0 && (
                  <p className="text-sm text-neutral-500 text-center mt-2">
                    Complete at least one frame to enable export
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Auto-play animation effect
// useEffect(() => {
//   if (isAnimating && completedFrames.length > 1) {
//     const interval = setInterval(() => {
//       setCurrentFrame(prev => (prev + 1) % completedFrames.length)
//     }, animationSpeed)
//     return () => clearInterval(interval)
//   }
// }, [isAnimating, animationSpeed, completedFrames.length])
