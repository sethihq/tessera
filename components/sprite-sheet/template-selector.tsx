"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/origin-ui/card"
import { Badge } from "@/components/luxe-ui/badge"
import { Button } from "@/components/luxe-ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/origin-ui/select"
import { 
  GridIcon, 
  PlayIcon, 
  EyeIcon, 
  CheckIcon,
  LayersIcon,
  WandIcon,
  PaletteIcon
} from "@/components/rounded-icons/icons"
import type { SpriteSheetTemplate } from "@/lib/types"

interface TemplateSelectorProps {
  templates: SpriteSheetTemplate[]
  selectedTemplate?: string
  onTemplateSelect: (template: SpriteSheetTemplate) => void
}

export function TemplateSelector({ templates, selectedTemplate, onTemplateSelect }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Group templates by category
  const categories = ["all", ...Array.from(new Set(templates.map(t => t.category)))]
  
  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "animation":
        return <PlayIcon className="w-4 h-4" />
      case "emotions":
        return <PaletteIcon className="w-4 h-4" />
      case "outfits":
        return <LayersIcon className="w-4 h-4" />
      case "actions":
        return <WandIcon className="w-4 h-4" />
      default:
        return <GridIcon className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "animation":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
      case "emotions":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
      case "outfits":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
      case "actions":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800"
      default:
        return "bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-950 dark:text-neutral-300 dark:border-neutral-800"
    }
  }

  const getTemplatePreview = (template: SpriteSheetTemplate) => {
    const frameCount = template.template_data.frames.length
    const { rows, cols } = template.dimensions
    
    return (
      <div className="space-y-2">
        <div className="text-xs text-neutral-500">
          {rows} × {cols} ({frameCount} frames)
        </div>
        <div 
          className="grid gap-1 bg-neutral-100 dark:bg-neutral-800 p-2 rounded"
          style={{ 
            gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)`,
            aspectRatio: `${Math.min(cols, 4)} / ${Math.min(rows, 3)}`
          }}
        >
          {template.template_data.frames.slice(0, 12).map((frame, index) => (
            <div
              key={index}
              className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded border border-neutral-300 dark:border-neutral-600 flex items-center justify-center"
            >
              <div className="text-xs text-neutral-500 text-center">
                {frame.properties.emotion && (
                  <div>
                    {frame.properties.emotion === "happy" && "😊"}
                    {frame.properties.emotion === "sad" && "😢"}
                    {frame.properties.emotion === "angry" && "😠"}
                    {frame.properties.emotion === "surprised" && "😲"}
                    {frame.properties.emotion === "neutral" && "😐"}
                    {!["happy", "sad", "angry", "surprised", "neutral"].includes(frame.properties.emotion!) && "🙂"}
                  </div>
                )}
                {frame.properties.action && frame.properties.action !== "idle" && (
                  <div className="text-xs mt-1">
                    {frame.properties.action.slice(0, 4)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {frameCount > 12 && (
            <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded border border-neutral-300 dark:border-neutral-600 flex items-center justify-center">
              <div className="text-xs text-neutral-500">
                +{frameCount - 12}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Category:</span>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            {categories.slice(1).map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplate === template.id
          
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? "ring-2 ring-neutral-900 dark:ring-neutral-100 ring-offset-2" 
                  : "hover:border-neutral-300 dark:hover:border-neutral-600"
              }`}
              onClick={() => onTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    {template.name}
                  </CardTitle>
                  {isSelected && (
                    <CheckIcon className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="muted"
                    className={`text-xs ${getCategoryColor(template.category)}`}
                  >
                    {template.category}
                  </Badge>
                  {template.is_public && (
                    <Badge variant="neutral" className="text-xs">
                      Public
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs mb-3">
                  {template.description}
                </CardDescription>
                
                {getTemplatePreview(template)}

                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex justify-between items-center text-xs text-neutral-500">
                    <span>
                      {template.frame_size.width} × {template.frame_size.height}px
                    </span>
                    <span>
                      {template.template_data.frames.length} frames
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Custom Template Option */}
      <Card className="border-dashed border-2">
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <GridIcon className="w-8 h-8 mx-auto text-neutral-400" />
            <h3 className="font-medium">Custom Sprite Sheet</h3>
            <p className="text-sm text-neutral-500">
              Start with a blank template and configure everything yourself
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Create a minimal custom template
                const customTemplate: SpriteSheetTemplate = {
                  id: "custom",
                  name: "Custom",
                  description: "Custom sprite sheet configuration",
                  category: "custom" as any,
                  template_data: { frames: [] },
                  dimensions: { rows: 4, cols: 4 },
                  frame_size: { width: 64, height: 64 },
                  is_public: false,
                  created_at: new Date().toISOString()
                }
                onTemplateSelect(customTemplate)
              }}
            >
              Use Custom Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* No templates message */}
      {filteredTemplates.length === 0 && selectedCategory !== "all" && (
        <div className="text-center py-8">
          <GridIcon className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            No templates found
          </h3>
          <p className="text-sm text-neutral-500">
            No templates available in the {selectedCategory} category.
          </p>
        </div>
      )}
    </div>
  )
}
