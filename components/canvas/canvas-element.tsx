"use client"

import React, { useRef, useEffect, useState } from "react"
import { useCanvasStore } from "@/lib/stores/canvas-store"

interface CanvasElementProps {
  id: string
  x: number
  y: number
  width: number
  height: number
  children: React.ReactNode
  className?: string
  onSelect?: (id: string) => void
  onDrag?: (id: string, newX: number, newY: number) => void
}

export function CanvasElement({
  id,
  x,
  y,
  width,
  height,
  children,
  className = "",
  onSelect,
  onDrag,
}: CanvasElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  const {
    selectedElements,
    hoveredElement,
    scale,
    selectElement,
    clearSelection,
    setHoveredElement,
    isElementInViewport,
    screenToCanvas,
  } = useCanvasStore()

  const isSelected = selectedElements.has(id)
  const isHovered = hoveredElement === id

  // Check if element is in viewport for performance
  const isInViewport = isElementInViewport(x, y, width, height)
  
  // Don't render if outside viewport
  if (!isInViewport) {
    return null
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (e.button === 0) { // Left click
      if (!e.ctrlKey && !e.metaKey) {
        clearSelection()
      }
      selectElement(id)
      onSelect?.(id)

      // Start drag
      const rect = elementRef.current?.getBoundingClientRect()
      if (rect) {
        const canvasCoords = screenToCanvas(e.clientX, e.clientY)
        setDragOffset({
          x: canvasCoords.x - x,
          y: canvasCoords.y - y,
        })
        setIsDragging(true)
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && onDrag) {
      const canvasCoords = screenToCanvas(e.clientX, e.clientY)
      const newX = canvasCoords.x - dragOffset.x
      const newY = canvasCoords.y - dragOffset.y
      onDrag(id, newX, newY)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseEnter = () => {
    setHoveredElement(id)
  }

  const handleMouseLeave = () => {
    if (!isDragging) {
      setHoveredElement(null)
    }
  }

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (onDrag) {
          const canvasCoords = screenToCanvas(e.clientX, e.clientY)
          const newX = canvasCoords.x - dragOffset.x
          const newY = canvasCoords.y - dragOffset.y
          onDrag(id, newX, newY)
        }
      }

      const handleGlobalMouseUp = () => {
        setIsDragging(false)
      }

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, dragOffset, onDrag, id, screenToCanvas])

  return (
    <div
      ref={elementRef}
      className={`absolute select-none transition-all duration-150 ${className} ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      } ${
        isHovered ? 'shadow-md' : ''
      } ${
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
      }`}
      style={{
        left: x,
        top: y,
        width,
        height,
        zIndex: isSelected ? 1000 : isDragging ? 1001 : 1,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Selection handles */}
      {isSelected && (
        <>
          {/* Corner handles */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          
          {/* Edge handles */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
        </>
      )}
    </div>
  )
}
