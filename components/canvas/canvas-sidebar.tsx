"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  FolderIcon,
  PlusIcon,
  Grid3X3Icon,
  SearchIcon,
  SettingsIcon,
  ChevronRightIcon,
  ChevronDownIcon,
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
    color: "bg-blue-500",
    category: "Input",
  },
  {
    id: "style-ref",
    type: "style-ref",
    title: "Style Reference",
    description: "Upload reference images for consistent style",
    icon: ImageIcon,
    color: "bg-green-500",
    category: "Input",
  },
  {
    id: "sprite-sheet",
    type: "sprite-sheet",
    title: "Sprite Sheet Generator",
    description: "Generate character animation frames",
    icon: Grid3X3Icon,
    color: "bg-purple-500",
    category: "Generator",
  },
  {
    id: "parallax",
    type: "parallax",
    title: "Parallax Background",
    description: "Multi-layer scrolling backgrounds",
    icon: LayersIcon,
    color: "bg-blue-500",
    category: "Generator",
  },
  {
    id: "tileset",
    type: "tileset",
    title: "Tileset Generator",
    description: "Seamless tile patterns",
    icon: Grid3X3Icon,
    color: "bg-orange-500",
    category: "Generator",
  },
  {
    id: "props",
    type: "props",
    title: "Props & Objects",
    description: "Individual game objects",
    icon: PackageIcon,
    color: "bg-yellow-500",
    category: "Generator",
  },
  {
    id: "sprite-to-gif",
    type: "sprite-to-gif",
    title: "Sprite to GIF",
    description: "Convert sprite sheets to animated GIFs",
    icon: ZapIcon,
    color: "bg-pink-500",
    category: "Converter",
  },
  {
    id: "export",
    type: "export",
    title: "Export Node",
    description: "Export assets in various formats",
    icon: DownloadIcon,
    color: "bg-gray-500",
    category: "Output",
  },
]

interface Project {
  id: string
  name: string
  type: "game" | "prototype" | "asset-pack"
  assetCount: number
  lastModified: string
  status: "active" | "archived"
}

interface Asset {
  id: string
  name: string
  type: "sprite-sheet" | "parallax" | "style-ref" | "tileset"
  status: "completed" | "generating" | "draft"
  size: string
  projectId: string
}

const DEMO_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Medieval RPG",
    type: "game",
    assetCount: 24,
    lastModified: "2 hours ago",
    status: "active",
  },
  {
    id: "2",
    name: "Pixel Art Pack",
    type: "asset-pack",
    assetCount: 12,
    lastModified: "1 day ago",
    status: "active",
  },
  {
    id: "3",
    name: "Platformer Demo",
    type: "prototype",
    assetCount: 8,
    lastModified: "3 days ago",
    status: "archived",
  },
]

const DEMO_ASSETS: Asset[] = [
  {
    id: "1",
    name: "Hero Walk Cycle",
    type: "sprite-sheet",
    status: "completed",
    size: "2.4 MB",
    projectId: "1",
  },
  {
    id: "2",
    name: "Forest Background",
    type: "parallax",
    status: "generating",
    size: "5.1 MB",
    projectId: "1",
  },
  {
    id: "3",
    name: "Art Style Guide",
    type: "style-ref",
    status: "completed",
    size: "1.2 MB",
    projectId: "1",
  },
]

interface CanvasSidebarProps {
  side: "left" | "right"
  width?: number
  isCollapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

export function CanvasSidebar({ side, width = 280, isCollapsed = false, onCollapse }: CanvasSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(["1"]))
  const [selectedProject, setSelectedProject] = useState<string | null>("1")
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"nodes" | "projects">("nodes")

  const handleDragStart = (event: React.DragEvent, nodeType: (typeof NODE_TYPES)[0]) => {
    event.dataTransfer.setData("application/reactflow", nodeType.type)
    event.dataTransfer.setData("application/json", JSON.stringify(nodeType))
    event.dataTransfer.effectAllowed = "move"
  }

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const getAssetIcon = (type: Asset["type"]) => {
    switch (type) {
      case "sprite-sheet":
        return <Grid3X3Icon className="w-4 h-4 text-purple-500" />
      case "parallax":
        return <LayersIcon className="w-4 h-4 text-blue-500" />
      case "style-ref":
        return <ImageIcon className="w-4 h-4 text-green-500" />
      case "tileset":
        return <Grid3X3Icon className="w-4 h-4 text-orange-500" />
    }
  }

  const getStatusBadge = (status: Asset["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
            Ready
          </Badge>
        )
      case "generating":
        return (
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
            Processing
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
            Draft
          </Badge>
        )
    }
  }

  const filteredProjects = DEMO_PROJECTS.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredAssets = DEMO_ASSETS.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedProject ? asset.projectId === selectedProject : true),
  )

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
        className={`${side === "left" ? "border-r" : "border-l"} border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900`}
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
        className="border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col"
        style={{ width }}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Tessera</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <PlusIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onCollapse?.(true)} className="w-8 h-8 p-0">
                <ChevronRightIcon className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-3 flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("nodes")}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "nodes"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              Nodes
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "projects"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              Projects
            </button>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder={activeTab === "nodes" ? "Search nodes..." : "Search projects & assets..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {activeTab === "nodes" ? (
            <div className="p-4 space-y-4">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                Drag nodes to the canvas to create your workflow
              </div>

              {Object.entries(nodesByCategory).map(([category, nodes]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{category}</h3>
                  <div className="space-y-1">
                    {nodes.map((node) => {
                      const Icon = node.icon
                      return (
                        <div
                          key={node.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, node)}
                          className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-grab active:cursor-grabbing transition-colors shadow-sm"
                        >
                          <div className={`p-2 rounded-lg ${node.color} text-white`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {node.title}
                            </div>
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
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  <Grid3X3Icon className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No nodes found</p>
                </div>
              )}
            </div>
          ) : (
            // Projects section (existing code)
            <div className="p-4 space-y-2">
              {filteredProjects.map((project) => (
                <div key={project.id} className="space-y-1">
                  {/* Project Header */}
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedProject === project.id
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                    onClick={() => {
                      setSelectedProject(project.id)
                      toggleProject(project.id)
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-5 h-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleProject(project.id)
                      }}
                    >
                      {expandedProjects.has(project.id) ? (
                        <ChevronDownIcon className="w-3 h-3" />
                      ) : (
                        <ChevronRightIcon className="w-3 h-3" />
                      )}
                    </Button>
                    <FolderIcon className="w-4 h-4" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{project.name}</span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {project.assetCount}
                        </Badge>
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{project.lastModified}</div>
                    </div>
                  </div>

                  {/* Project Assets */}
                  {expandedProjects.has(project.id) && (
                    <div className="ml-7 space-y-1">
                      {filteredAssets
                        .filter((asset) => asset.projectId === project.id)
                        .map((asset) => (
                          <div
                            key={asset.id}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedAsset === asset.id
                                ? "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                                : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            }`}
                            onClick={() => setSelectedAsset(asset.id)}
                          >
                            {getAssetIcon(asset.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm truncate">{asset.name}</span>
                                {getStatusBadge(asset.status)}
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400">{asset.size}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Quick Actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="space-y-2">
            {activeTab === "nodes" ? (
              <>
                <Button className="w-full justify-start h-8 text-sm bg-[#FF6600] hover:bg-[#E55A00]">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Custom Node
                </Button>
                <Button variant="outline" className="w-full justify-start h-8 text-sm bg-transparent">
                  <Grid3X3Icon className="w-4 h-4 mr-2" />
                  Node Templates
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full justify-start h-8 text-sm bg-[#FF6600] hover:bg-[#E55A00]">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New Asset
                </Button>
                <Button variant="outline" className="w-full justify-start h-8 text-sm bg-transparent">
                  <Grid3X3Icon className="w-4 h-4 mr-2" />
                  Templates
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Right sidebar - Properties panel
  return (
    <div
      className="border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col"
      style={{ width }}
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Properties</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <SettingsIcon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onCollapse?.(true)} className="w-8 h-8 p-0">
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {selectedAsset ? (
            <>
              {/* Asset Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Asset Properties</CardTitle>
                  <CardDescription className="text-xs">Configure generation settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Name</label>
                    <Input defaultValue="Hero Walk Cycle" className="h-7 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Type</label>
                    <div className="flex items-center gap-2">
                      <Grid3X3Icon className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">Sprite Sheet</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Dimensions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input defaultValue="32" className="h-7 text-sm" />
                      <Input defaultValue="32" className="h-7 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Frames</label>
                    <Input defaultValue="8" className="h-7 text-sm" />
                  </div>
                </CardContent>
              </Card>

              {/* Export Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Export Settings</CardTitle>
                  <CardDescription className="text-xs">Configure output format</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Format</label>
                    <select className="w-full h-7 text-sm border border-neutral-200 dark:border-neutral-800 rounded">
                      <option>PNG Sequence</option>
                      <option>Single Sheet</option>
                      <option>Unity Package</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Quality</label>
                    <select className="w-full h-7 text-sm border border-neutral-200 dark:border-neutral-800 rounded">
                      <option>High (PNG)</option>
                      <option>Medium (JPEG)</option>
                      <option>Low (WEBP)</option>
                    </select>
                  </div>
                  <Button className="w-full h-7 text-sm">Export Asset</Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <Grid3X3Icon className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select an asset to view properties</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
