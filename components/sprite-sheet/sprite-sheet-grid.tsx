"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/luxe-ui/button"
import { 
  CheckCircleIcon, 
  AlertCircleIcon, 
  LoaderIcon, 
  EyeIcon,
  WandIcon,
  PlayIcon
} from "@/components/rounded-icons/icons"
import type { SpriteSheet, SpriteSheetFrame } from "@/lib/types"

interface SpriteSheetGridProps {
  spriteSheet: SpriteSheet
  selectedFrame?: SpriteSheetFrame | null
  onFrameSelect: (frame: SpriteSheetFrame) => void
  showControls?: boolean
  onGenerateFrame?: (frame: SpriteSheetFrame) => void
  onPreviewAnimation?: () => void
}

export function SpriteSheetGrid({ 
  spriteSheet, 
  selectedFrame, 
  onFrameSelect,
  showControls = true,
  onGenerateFrame,
  onPreviewAnimation
}: SpriteSheetGridProps) {
  const [hoveredFrame, setHoveredFrame] = useState<string | null>(null)

  const getFrameStatusIcon = (frame: SpriteSheetFrame) => {
    switch (frame.status) {
      case "completed":
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case "generating":
        return <LoaderIcon className="w-4 h-4 text-blue-500 animate-spin" />
      case "error":
        return <AlertCircleIcon className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-neutral-300 dark:border-neutral-600" />
    }
  }

  const getFrameStatusColor = (frame: SpriteSheetFrame) => {
    switch (frame.status) {
      case "completed":
        return "border-green-500 bg-green-50 dark:bg-green-950"
      case "generating":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950"
      case "error":
        return "border-red-500 bg-red-50 dark:bg-red-950"
      default:
        return "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
    }
  }

  const getFramePreview = (frame: SpriteSheetFrame) => {
    if (frame.image_url) {
      return (
        <img
          src={frame.image_url}
          alt={`Frame ${frame.position.row},${frame.position.col}`}
          className="w-full h-full object-cover rounded"
        />
      )
    }

    // Show property preview for pending frames
    const { emotion, action, clothing } = frame.properties
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-xs text-neutral-500 dark:text-neutral-400 p-1">
        {emotion && (
          <div className="text-center">
            <span className="font-medium">😊</span>
            <div>{emotion}</div>
          </div>
        )}
        {action && (
          <div className="text-center mt-1">
            <div>{action}</div>
          </div>
        )}
        {clothing && clothing !== "base" && (
          <div className="text-center mt-1">
            <div className="text-xs">{clothing}</div>
          </div>
        )}
      </div>
    )
  }

  // Sort frames by position for proper grid display
  const sortedFrames = [...spriteSheet.frames].sort((a, b) => {
    if (a.position.row !== b.position.row) {
      return a.position.row - b.position.row
    }
    return a.position.col - b.position.col
  })

  // Create grid layout
  const gridFrames: (SpriteSheetFrame | null)[][] = []
  for (let row = 0; row < spriteSheet.dimensions.rows; row++) {
    gridFrames[row] = []
    for (let col = 0; col < spriteSheet.dimensions.cols; col++) {
      const frame = sortedFrames.find(f => f.position.row === row && f.position.col === col)
      gridFrames[row][col] = frame || null
    }
  }

  return (
    <div className="space-y-4">
      {/* Grid Controls */}
      {showControls && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {spriteSheet.dimensions.rows} × {spriteSheet.dimensions.cols} frames
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="w-3 h-3 text-green-500" />
                <span className="text-xs">Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <LoaderIcon className="w-3 h-3 text-blue-500" />
                <span className="text-xs">Generating</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full border border-neutral-300" />
                <span className="text-xs">Pending</span>
              </div>
            </div>
          </div>

          {onPreviewAnimation && (
            <Button
              onClick={onPreviewAnimation}
              variant="smooth"
              size="sm"
              className="flex items-center gap-2"
            >
              <PlayIcon className="w-4 h-4" />
              Preview Animation
            </Button>
          )}
        </div>
      )}

      {/* Sprite Sheet Grid */}
      <div className="w-full max-w-4xl mx-auto">
        <div 
          className="grid gap-2 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg"
          style={{
            gridTemplateColumns: `repeat(${spriteSheet.dimensions.cols}, 1fr)`,
            aspectRatio: `${spriteSheet.dimensions.cols} / ${spriteSheet.dimensions.rows}`
          }}
        >
          {gridFrames.map((row, rowIndex) =>
            row.map((frame, colIndex) => {
              if (!frame) {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded border-2 border-dashed border-neutral-300 dark:border-neutral-600"
                  />
                )
              }

              const isSelected = selectedFrame?.id === frame.id
              const isHovered = hoveredFrame === frame.id

              return (
                <div
                  key={frame.id}
                  className={`
                    relative aspect-square rounded border-2 cursor-pointer transition-all duration-200 group
                    ${getFrameStatusColor(frame)}
                    ${isSelected ? "ring-2 ring-neutral-900 dark:ring-neutral-100 ring-offset-2" : ""}
                    ${isHovered ? "scale-105 shadow-lg" : ""}
                  `}
                  onClick={() => onFrameSelect(frame)}
                  onMouseEnter={() => setHoveredFrame(frame.id)}
                  onMouseLeave={() => setHoveredFrame(null)}
                >
                  {/* Frame Content */}
                  <div className="w-full h-full overflow-hidden rounded">
                    {getFramePreview(frame)}
                  </div>

                  {/* Frame Status Indicator */}
                  <div className="absolute top-1 left-1">
                    {getFrameStatusIcon(frame)}
                  </div>

                  {/* Frame Position Label */}
                  <div className="absolute top-1 right-1">
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {frame.position.row},{frame.position.col}
                    </Badge>
                  </div>

                  {/* Frame Actions (on hover) */}
                  {isHovered && showControls && (
                    <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="elevated"
                          className="text-xs px-2 py-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            onFrameSelect(frame)
                          }}
                        >
                          <EyeIcon className="w-3 h-3" />
                        </Button>
                        {onGenerateFrame && frame.status !== "generating" && (
                          <Button
                            size="sm"
                            variant="smooth"
                            className="text-xs px-2 py-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              onGenerateFrame(frame)
                            }}
                          >
                            <WandIcon className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Property Tags */}
                  {frame.status === "pending" && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="flex flex-wrap gap-1">
                        {frame.properties.emotion && frame.properties.emotion !== "neutral" && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {frame.properties.emotion}
                          </Badge>
                        )}
                        {frame.properties.action && frame.properties.action !== "idle" && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {frame.properties.action}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Grid Info */}
      <div className="flex justify-between items-center text-sm text-neutral-500 dark:text-neutral-400">
        <div>
          Frame size: {spriteSheet.frame_size.width} × {spriteSheet.frame_size.height}px
        </div>
        <div>
          Total: {spriteSheet.frames.length} frames
        </div>
      </div>

      {/* Selected Frame Info */}
      {selectedFrame && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">
                  Frame {selectedFrame.position.row + 1},{selectedFrame.position.col + 1}
                </h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Status: {selectedFrame.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedFrame.image_url && (
                  <div className="w-16 h-16 border rounded overflow-hidden">
                    <img
                      src={selectedFrame.image_url}
                      alt="Frame preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {getFrameStatusIcon(selectedFrame)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
