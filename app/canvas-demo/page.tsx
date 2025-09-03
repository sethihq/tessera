"use client"

import React, { useEffect, useState } from "react"
import { InfiniteCanvas } from "@/components/canvas/infinite-canvas"
import { CanvasElement } from "@/components/canvas/canvas-element"
import { useCanvasKeyboard, useCanvasStore } from "@/lib/stores/canvas-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/luxe-ui/button"
import { GridIcon, PlusIcon, RefreshCwIcon } from "@/components/rounded-icons/icons"

interface AssetNode {
  id: string
  type: 'sprite-sheet' | 'parallax' | 'style-ref' | 'generator'
  title: string
  description: string
  x: number
  y: number
  width: number
  height: number
  status: 'idle' | 'generating' | 'completed' | 'error'
  preview?: string
}

const DEMO_ASSETS: AssetNode[] = [
  {
    id: 'sprite-1',
    type: 'sprite-sheet',
    title: 'Character Walk Cycle',
    description: '8-frame walking animation for RPG character',
    x: 100,
    y: 100,
    width: 280,
    height: 180,
    status: 'completed',
  },
  {
    id: 'style-1',
    type: 'style-ref',
    title: 'Medieval Fantasy Style',
    description: 'Dark, atmospheric medieval art style reference',
    x: 450,
    y: 50,
    width: 260,
    height: 160,
    status: 'completed',
  },
  {
    id: 'parallax-1',
    type: 'parallax',
    title: 'Forest Background',
    description: '5-layer parallax scrolling forest scene',
    x: 200,
    y: 320,
    width: 300,
    height: 200,
    status: 'generating',
  },
  {
    id: 'generator-1',
    type: 'generator',
    title: 'AI Asset Generator',
    description: 'Prompt-based asset creation node',
    x: 600,
    y: 280,
    width: 280,
    height: 160,
    status: 'idle',
  },
]

export default function CanvasDemoPage() {
  const [assets, setAssets] = useState<AssetNode[]>(DEMO_ASSETS)
  const { setViewport, resetTransform } = useCanvasStore()
  const { handleKeyDown, handleKeyUp } = useCanvasKeyboard()

  useEffect(() => {
    // Set initial viewport size
    const updateViewport = () => {
      setViewport(window.innerWidth, window.innerHeight)
    }
    
    updateViewport()
    window.addEventListener('resize', updateViewport)

    // Add keyboard listeners
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('resize', updateViewport)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [setViewport, handleKeyDown, handleKeyUp])

  const handleAssetDrag = (id: string, newX: number, newY: number) => {
    setAssets(prev => 
      prev.map(asset => 
        asset.id === id ? { ...asset, x: newX, y: newY } : asset
      )
    )
  }

  const addRandomAsset = () => {
    const types: AssetNode['type'][] = ['sprite-sheet', 'parallax', 'style-ref', 'generator']
    const randomType = types[Math.floor(Math.random() * types.length)]
    
    const newAsset: AssetNode = {
      id: `asset-${Date.now()}`,
      type: randomType,
      title: `New ${randomType.replace('-', ' ')}`,
      description: 'Newly created asset node',
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      width: 280,
      height: 180,
      status: 'idle',
    }

    setAssets(prev => [...prev, newAsset])
  }

  const getAssetIcon = (type: AssetNode['type']) => {
    switch (type) {
      case 'sprite-sheet': return <GridIcon className="w-5 h-5" />
      case 'parallax': return <GridIcon className="w-5 h-5" />
      case 'style-ref': return <GridIcon className="w-5 h-5" />
      case 'generator': return <GridIcon className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: AssetNode['status']) => {
    switch (status) {
      case 'idle': return 'bg-gray-100 text-gray-700'
      case 'generating': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'error': return 'bg-red-100 text-red-700'
    }
  }

  const getTypeColor = (type: AssetNode['type']) => {
    switch (type) {
      case 'sprite-sheet': return 'border-l-purple-500'
      case 'parallax': return 'border-l-blue-500'
      case 'style-ref': return 'border-l-green-500'
      case 'generator': return 'border-l-orange-500'
    }
  }

  return (
    <div className="h-screen w-screen bg-neutral-900 text-white">
      {/* Top toolbar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-neutral-800/90 backdrop-blur-sm border-b border-neutral-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Tessera Canvas Demo</h1>
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <span>Interactive Asset Workspace</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={addRandomAsset} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
            <Button onClick={resetTransform} size="sm" variant="outline">
              Reset View
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <InfiniteCanvas className="h-full w-full pt-16">
        {assets.map((asset) => (
          <CanvasElement
            key={asset.id}
            id={asset.id}
            x={asset.x}
            y={asset.y}
            width={asset.width}
            height={asset.height}
            onDrag={handleAssetDrag}
            className="rounded-lg shadow-lg hover:shadow-xl"
          >
            <Card className={`h-full w-full bg-neutral-800 border-neutral-600 border-l-4 ${getTypeColor(asset.type)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getAssetIcon(asset.type)}
                    <CardTitle className="text-sm font-semibold text-white">
                      {asset.title}
                    </CardTitle>
                  </div>
                  <Badge 
                    className={`text-xs ${getStatusColor(asset.status)}`}
                    variant="secondary"
                  >
                    {asset.status === 'generating' && <RefreshCwIcon className="w-3 h-3 mr-1 animate-spin" />}
                    {asset.status}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-neutral-400">
                  {asset.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Preview area */}
                <div className="h-16 bg-neutral-700 rounded border-2 border-dashed border-neutral-600 flex items-center justify-center">
                  {asset.status === 'generating' ? (
                    <RefreshCwIcon className="w-6 h-6 animate-spin text-blue-400" />
                  ) : asset.status === 'completed' ? (
                    <div className="text-green-400 text-xs">✓ Generated</div>
                  ) : (
                    <div className="text-neutral-500 text-xs">No preview</div>
                  )}
                </div>
                
                {/* Quick actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs h-7">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs h-7">
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CanvasElement>
        ))}
      </InfiniteCanvas>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-neutral-800/90 backdrop-blur-sm border-t border-neutral-700 p-2">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-4">
            <span>Assets: {assets.length}</span>
            <span>|</span>
            <span>Selected: {useCanvasStore.getState().selectedElements.size}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Press Space to pan • Scroll to zoom • Drag assets to move</span>
          </div>
        </div>
      </div>
    </div>
  )
}
