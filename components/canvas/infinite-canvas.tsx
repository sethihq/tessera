"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { useCanvasStore } from "@/lib/stores/canvas-store"

interface InfiniteCanvasProps {
  children?: React.ReactNode
  className?: string
}

export function InfiniteCanvas({ children, className = "" }: InfiniteCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })
  
  const { 
    scale, 
    offsetX, 
    offsetY, 
    setScale, 
    setOffset, 
    panCanvas, 
    zoomCanvas 
  } = useCanvasStore()

  const gridSize = 20
  const dotSize = 1

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(5, scale * zoomFactor))
    
    // Calculate new offset to zoom towards mouse position
    const scaleChange = newScale / scale
    const newOffsetX = mouseX - (mouseX - offsetX) * scaleChange
    const newOffsetY = mouseY - (mouseY - offsetY) * scaleChange
    
    setScale(newScale)
    setOffset(newOffsetX, newOffsetY)
  }, [scale, offsetX, offsetY, setScale, setOffset])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 1 && !(e.button === 0 && e.shiftKey)) return // Middle click or Shift+Left click
    
    setIsDragging(true)
    setLastMouse({ x: e.clientX, y: e.clientY })
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastMouse.x
    const deltaY = e.clientY - lastMouse.y

    panCanvas(deltaX, deltaY)
    setLastMouse({ x: e.clientX, y: e.clientY })
  }, [isDragging, lastMouse, panCanvas])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Grid background calculations
  const getGridStyle = () => {
    const scaledGridSize = gridSize * scale
    const patternOffsetX = (offsetX % scaledGridSize)
    const patternOffsetY = (offsetY % scaledGridSize)
    
    return {
      backgroundImage: `radial-gradient(circle, rgba(156, 163, 175, 0.4) ${dotSize}px, transparent ${dotSize}px)`,
      backgroundSize: `${scaledGridSize}px ${scaledGridSize}px`,
      backgroundPosition: `${patternOffsetX}px ${patternOffsetY}px`,
    }
  }

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 ${className}`}
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        ...getGridStyle(),
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Canvas content with transform */}
      <div
        className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        }}
      >
        {children}
      </div>

      {/* Canvas info overlay */}
      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white font-mono">
        Scale: {Math.round(scale * 100)}% | X: {Math.round(offsetX)} | Y: {Math.round(offsetY)}
      </div>

      {/* Canvas instructions */}
      <div className="absolute bottom-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white">
        <div className="flex flex-col gap-1">
          <span>🖱️ Middle-click + drag to pan</span>
          <span>⚡ Shift + click + drag to pan</span>
          <span>🔍 Scroll wheel to zoom</span>
        </div>
      </div>
    </div>
  )
}
