"use client"

import React, { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/luxe-ui/button"
import { GridIcon, RefreshCwIcon, PlayIcon, SettingsIcon } from "@/components/rounded-icons/icons"
import { Handle, Position } from 'reactflow'

interface AssetNodeProps {
  id: string
  data: {
    type: 'sprite-sheet' | 'parallax' | 'style-ref' | 'generator' | 'export'
    title: string
    description: string
    status: 'idle' | 'generating' | 'completed' | 'error'
    preview?: string
    inputs?: string[]
    outputs?: string[]
    config?: Record<string, any>
  }
  selected: boolean
}

export const AssetNode = memo(({ id, data, selected }: AssetNodeProps) => {
  const { type, title, description, status, preview, inputs = [], outputs = [] } = data

  const getTypeColor = () => {
    switch (type) {
      case 'sprite-sheet': return 'border-l-purple-500 bg-purple-50 dark:bg-purple-950'
      case 'parallax': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
      case 'style-ref': return 'border-l-green-500 bg-green-50 dark:bg-green-950'
      case 'generator': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950'
      case 'export': return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'idle': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      case 'generating': return 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
      case 'error': return 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'sprite-sheet': return <GridIcon className="w-4 h-4" />
      case 'parallax': return <GridIcon className="w-4 h-4" />
      case 'style-ref': return <GridIcon className="w-4 h-4" />
      case 'generator': return <GridIcon className="w-4 h-4" />
      case 'export': return <GridIcon className="w-4 h-4" />
    }
  }

  return (
    <div className={`min-w-[280px] relative ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* React Flow handles for inputs (targets) */}
      {inputs.map((input, index) => (
        <Handle
          key={`input-${index}`}
          type="target"
          position={Position.Left}
          id={input}
          style={{ top: 50 + index * 20 }}
        />
      ))}

      {/* React Flow handles for outputs (sources) */}
      {outputs.map((output, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={Position.Right}
          id={output}
          style={{ top: 50 + index * 20 }}
        />
      ))}

      <Card className={`border-l-4 ${getTypeColor()} shadow-lg hover:shadow-xl transition-shadow duration-200`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getIcon()}
              <CardTitle className="text-sm font-semibold">
                {title}
              </CardTitle>
            </div>
            <Badge className={`text-xs ${getStatusColor()}`} variant="secondary">
              {status === 'generating' && <RefreshCwIcon className="w-3 h-3 mr-1 animate-spin" />}
              {status}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Preview area */}
          <div className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex items-center justify-center">
            {status === 'generating' ? (
              <RefreshCwIcon className="w-6 h-6 animate-spin text-blue-500" />
            ) : status === 'completed' ? (
              <div className="text-green-500 text-xs">✓ Ready</div>
            ) : (
              <div className="text-neutral-500 text-xs">No preview</div>
            )}
          </div>
          
          {/* Node actions */}
          <div className="flex gap-2">
            {status === 'idle' && (
              <Button size="sm" variant="outline" className="flex-1 text-xs h-7">
                <PlayIcon className="w-3 h-3 mr-1" />
                Run
              </Button>
            )}
            <Button size="sm" variant="outline" className="flex-1 text-xs h-7">
              <SettingsIcon className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>

          {/* Connection info */}
          {(inputs.length > 0 || outputs.length > 0) && (
            <div className="text-xs text-neutral-500 space-y-1">
              {inputs.length > 0 && (
                <div>Inputs: {inputs.join(', ')}</div>
              )}
              {outputs.length > 0 && (
                <div>Outputs: {outputs.join(', ')}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
})

AssetNode.displayName = 'AssetNode'
