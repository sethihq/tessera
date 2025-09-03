"use client"

import React, { useState, useEffect } from 'react'
import { NodeCanvas } from './node-canvas'
import { CanvasSidebar } from './canvas-sidebar'
import { Button } from '@/components/luxe-ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  PlusIcon, 
  PlayIcon, 
  SettingsIcon,
  MessageSquareIcon,
  GridIcon,
  LayersIcon,
  ZapIcon,
  DownloadIcon,
  FullscreenIcon
} from 'lucide-react'

interface CanvasWorkspaceProps {
  className?: string
}

export function CanvasWorkspace({ className = "" }: CanvasWorkspaceProps) {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)
  const [chatExpanded, setChatExpanded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Handle fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault()
        setIsFullscreen(!isFullscreen)
      }
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const toolbarItems = [
    { id: 'select', icon: GridIcon, label: 'Select', active: true },
    { id: 'create', icon: PlusIcon, label: 'Create Node' },
    { id: 'connect', icon: ZapIcon, label: 'Connect' },
    { id: 'layers', icon: LayersIcon, label: 'Layers' },
  ]

  return (
    <div className={`h-screen w-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col overflow-hidden ${className}`}>
      {/* Top Header */}
      <header className="h-12 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Tessera Canvas
          </h1>
          <Badge variant="outline" className="text-xs">
            Medieval RPG Project
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 text-sm">
            <PlayIcon className="w-4 h-4 mr-2" />
            Run All
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-sm">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <FullscreenIcon className="w-4 h-4" />
          </Button>
          <Button size="sm" className="h-8 text-sm bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Node
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <CanvasSidebar
          side="left"
          width={280}
          isCollapsed={leftSidebarCollapsed}
          onCollapse={setLeftSidebarCollapsed}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Canvas */}
          <div className="flex-1 relative">
            <NodeCanvas className="absolute inset-0" />
            
            {/* Canvas overlay info */}
            <div className="absolute top-4 left-4 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-neutral-600 dark:text-neutral-400">4 Nodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-neutral-600 dark:text-neutral-400">3 Connections</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-neutral-600 dark:text-neutral-400">1 Processing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Toolbar */}
          <div className="h-16 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-4">
            {/* Left side - Tools */}
            <div className="flex items-center gap-2">
              {toolbarItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={item.active ? "default" : "ghost"}
                    size="sm"
                    className={`h-10 px-3 ${item.active ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                )
              })}
            </div>

            {/* Center - Chat Interface */}
            <div className="flex-1 max-w-md mx-4">
              <div className={`bg-neutral-100 dark:bg-neutral-700 rounded-lg transition-all duration-300 ${
                chatExpanded ? 'h-32' : 'h-10'
              }`}>
                <div className="p-2 flex items-center gap-2">
                  <MessageSquareIcon className="w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Ask AI to create nodes, modify connections..."
                    className="flex-1 bg-transparent text-sm text-neutral-700 dark:text-neutral-300 placeholder-neutral-500 outline-none"
                    onFocus={() => setChatExpanded(true)}
                    onBlur={() => setChatExpanded(false)}
                  />
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <ZapIcon className="w-3 h-3" />
                  </Button>
                </div>
                
                {chatExpanded && (
                  <div className="px-2 pb-2">
                    <div className="bg-white dark:bg-neutral-800 rounded p-3 text-sm">
                      <div className="space-y-2">
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Suggestions:</div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-neutral-100">
                            Add export node
                          </Badge>
                          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-neutral-100">
                            Connect to Unity
                          </Badge>
                          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-neutral-100">
                            Batch process
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Status */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-neutral-600 dark:text-neutral-400">Ready</span>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <SettingsIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <CanvasSidebar
          side="right"
          width={320}
          isCollapsed={rightSidebarCollapsed}
          onCollapse={setRightSidebarCollapsed}
        />
      </div>

      {/* Fullscreen Mode Overlay */}
      {isFullscreen && (
        <div className="absolute inset-0 bg-neutral-900 z-50">
          <div className="h-full w-full">
            <NodeCanvas />
            <div className="absolute top-4 right-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(false)}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                Exit Fullscreen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
