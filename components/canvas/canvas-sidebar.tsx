"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  PlusIcon,
  Grid3X3Icon,
  SearchIcon,
  SettingsIcon,
  ChevronRightIcon,
  LayersIcon,
  PackageIcon,
  ZapIcon,
  DownloadIcon,
  WandIcon,
  ImageIcon,
} from "lucide-react"

const NODE_TYPES = [
  {
    id: "prompt",
    type: "prompt",
    title: "Prompt Input",
    description: "Text prompt for AI generation",
    icon: WandIcon,
    category: "Input",
  },
  {
    id: "style-ref",
    type: "style-ref",
    title: "Style Reference",
    description: "Upload reference images for consistent style",
    icon: ImageIcon,
    category: "Input",
  },
  {
    id: "sprite-sheet",
    type: "sprite-sheet",
    title: "Sprite Sheet Generator",
    description: "Generate character animation frames",
    icon: Grid3X3Icon,
    category: "Generator",
  },
  {
    id: "parallax",
    type: "parallax",
    title: "Parallax Background",
    description: "Multi-layer scrolling backgrounds",
    icon: LayersIcon,
    category: "Generator",
  },
  {
    id: "tileset",
    type: "tileset",
    title: "Tileset Generator",
    description: "Seamless tile patterns",
    icon: Grid3X3Icon,
    category: "Generator",
  },
  {
    id: "props",
    type: "props",
    title: "Props & Objects",
    description: "Individual game objects",
    icon: PackageIcon,
    category: "Generator",
  },
  {
    id: "sprite-to-gif",
    type: "sprite-to-gif",
    title: "Sprite to GIF",
    description: "Convert sprite sheets to animated GIFs",
    icon: ZapIcon,
    category: "Converter",
  },
  {
    id: "export",
    type: "export",
    title: "Export Node",
    description: "Export assets in various formats",
    icon: DownloadIcon,
    category: "Output",
  },
]

interface CanvasSidebarProps {
  side: "left" | "right"
  width?: number
  isCollapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  onDeleteNode?: (nodeId: string) => void
}

export function CanvasSidebar({
  side,
  width = 280,
  isCollapsed = false,
  onCollapse,
  onDeleteNode,
}: CanvasSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleDragStart = (event: React.DragEvent, nodeType: (typeof NODE_TYPES)[0]) => {
    event.dataTransfer.setData("application/reactflow", nodeType.type)
    event.dataTransfer.setData("application/json", JSON.stringify(nodeType))
    event.dataTransfer.effectAllowed = "move"
  }

  const filteredNodes = NODE_TYPES.filter(
    (node) =>
      node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const nodesByCategory = filteredNodes.reduce(
    (acc, node) => {
      if (!acc[node.category]) {
        acc[node.category] = []
      }
      acc[node.category].push(node)
      return acc
    },
    {} as Record<string, typeof NODE_TYPES>,
  )

  if (isCollapsed) {
    return (
      <div
        className={`${side === "left" ? "border-r" : "border-l"} border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900`}
      >
        <div className="w-12 h-full flex flex-col items-center py-4 space-y-2">
          <Button variant="ghost" size="sm" onClick={() => onCollapse?.(false)} className="w-8 h-8 p-0">
            {side === "left" ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 rotate-180" />
            )}
          </Button>
        </div>
      </div>
    )
  }

  if (side === "left") {
    return (
      <div
        className="border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex flex-col"
        style={{ width }}
      >
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Nodes</h2>
            <Button variant="ghost" size="sm" onClick={() => onCollapse?.(true)} className="w-8 h-8 p-0">
              <ChevronRightIcon className="w-4 h-4 rotate-180" />
            </Button>
          </div>

          <div className="mt-3 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Drag nodes to the canvas to create your workflow
            </div>

            {Object.entries(nodesByCategory).map(([category, nodes]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {nodes.map((node) => {
                    const Icon = node.icon
                    return (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, node)}
                        className="group flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 cursor-grab active:cursor-grabbing transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 group-hover:bg-[#FF6600] group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{node.title}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                            {node.description}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {filteredNodes.length === 0 && (
              <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                <Grid3X3Icon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">No nodes found</p>
                <p className="text-xs mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="space-y-2">
            <Button className="w-full justify-start h-9 text-sm bg-[#FF6600] hover:bg-[#E55A00] text-white">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Custom Node
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-9 text-sm bg-transparent border-neutral-300 dark:border-neutral-700"
            >
              <Grid3X3Icon className="w-4 h-4 mr-2" />
              Node Templates
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex flex-col"
      style={{ width }}
    >
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Properties</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-neutral-500 hover:text-neutral-700">
              <SettingsIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCollapse?.(true)}
              className="w-8 h-8 p-0 text-neutral-500 hover:text-neutral-700"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
            <SettingsIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm">Select a node to view properties</p>
            <p className="text-xs mt-1">Configure settings and parameters</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
