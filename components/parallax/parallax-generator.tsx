"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/luxe-ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { 
  Layers, 
  Mountain, 
  TreePine, 
  Cloud, 
  Sparkles, 
  Download, 
  Eye, 
  Settings,
  Play,
  Pause,
  RotateCcw,
  Wand2
} from "lucide-react"

interface ParallaxLayer {
  id: string
  name: string
  type: 'sky' | 'background' | 'midground' | 'foreground' | 'ground'
  prompt: string
  depth: number
  scrollSpeed: number
  opacity: number
  generated: boolean
  imageUrl?: string
  generating: boolean
}

interface ParallaxTemplate {
  id: string
  name: string
  description: string
  category: string
  layers: Omit<ParallaxLayer, 'id' | 'generated' | 'imageUrl' | 'generating'>[]
  style: string
  defaultParameters: Record<string, any>
}

const PARALLAX_TEMPLATES: ParallaxTemplate[] = [
  {
    id: 'fantasy-forest',
    name: 'Fantasy Forest',
    description: 'Mystical forest with multiple depth layers',
    category: 'fantasy',
    style: 'fantasy digital art',
    defaultParameters: { mood: 'mystical', lighting: 'soft', colors: 'earth_tones' },
    layers: [
      { name: 'Sky', type: 'sky', prompt: 'Mystical sky with soft clouds and magical atmosphere', depth: 0.1, scrollSpeed: 0.1, opacity: 1.0 },
      { name: 'Far Mountains', type: 'background', prompt: 'Distant misty mountains in soft blues and purples', depth: 0.3, scrollSpeed: 0.3, opacity: 0.8 },
      { name: 'Forest Canopy', type: 'midground', prompt: 'Dense forest treetops with magical glowing particles', depth: 0.6, scrollSpeed: 0.6, opacity: 0.9 },
      { name: 'Tree Trunks', type: 'foreground', prompt: 'Large ancient tree trunks with detailed bark texture', depth: 0.8, scrollSpeed: 0.8, opacity: 1.0 },
      { name: 'Ground', type: 'ground', prompt: 'Forest floor with roots, mushrooms and scattered leaves', depth: 1.0, scrollSpeed: 1.0, opacity: 1.0 }
    ]
  },
  {
    id: 'pixel-platformer',
    name: 'Pixel Platformer',
    description: '16-bit style retro game background',
    category: 'pixel-art',
    style: '16-bit pixel art',
    defaultParameters: { palette: 'limited', style: 'retro', resolution: '16bit' },
    layers: [
      { name: 'Sky', type: 'sky', prompt: '16-bit pixel art sky with fluffy white clouds', depth: 0.1, scrollSpeed: 0.1, opacity: 1.0 },
      { name: 'Hills', type: 'background', prompt: 'Pixel art rolling hills in bright green', depth: 0.5, scrollSpeed: 0.5, opacity: 1.0 },
      { name: 'Ground', type: 'ground', prompt: 'Pixel art grass platform with detailed texture', depth: 1.0, scrollSpeed: 1.0, opacity: 1.0 }
    ]
  },
  {
    id: 'sci-fi-space',
    name: 'Sci-Fi Space',
    description: 'Futuristic space environment with nebulae',
    category: 'sci-fi',
    style: 'sci-fi digital art',
    defaultParameters: { mood: 'cosmic', lighting: 'dramatic', colors: 'neon' },
    layers: [
      { name: 'Deep Space', type: 'sky', prompt: 'Deep space with distant stars and cosmic dust', depth: 0.1, scrollSpeed: 0.05, opacity: 1.0 },
      { name: 'Nebula', type: 'background', prompt: 'Colorful space nebula with purple and blue gases', depth: 0.2, scrollSpeed: 0.15, opacity: 0.8 },
      { name: 'Asteroids', type: 'midground', prompt: 'Floating asteroids with detailed rocky surfaces', depth: 0.5, scrollSpeed: 0.4, opacity: 0.9 },
      { name: 'Space Platforms', type: 'foreground', prompt: 'Futuristic metal platforms floating in space', depth: 0.8, scrollSpeed: 0.7, opacity: 1.0 },
      { name: 'Energy Fields', type: 'ground', prompt: 'Glowing energy barriers and force fields', depth: 1.0, scrollSpeed: 1.0, opacity: 0.7 }
    ]
  }
]

interface ParallaxGeneratorProps {
  projects: any[]
  onAssetGenerated?: (asset: any) => void
}

export function ParallaxGenerator({ projects, onAssetGenerated }: ParallaxGeneratorProps) {
  const supabase = createClient()
  const [selectedTemplate, setSelectedTemplate] = useState<ParallaxTemplate | null>(null)
  const [customLayers, setCustomLayers] = useState<ParallaxLayer[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [newProjectName, setNewProjectName] = useState("")
  const [createNewProject, setCreateNewProject] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAsset, setGeneratedAsset] = useState<any>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1)

  // Initialize layers when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const initialLayers: ParallaxLayer[] = selectedTemplate.layers.map((layer, index) => ({
        id: `layer-${index}`,
        ...layer,
        generated: false,
        generating: false
      }))
      setCustomLayers(initialLayers)
    }
  }, [selectedTemplate])

  // Animation loop for preview
  useEffect(() => {
    if (!previewMode) return
    
    const interval = setInterval(() => {
      setScrollOffset(prev => (prev + animationSpeed) % 1000)
    }, 50)
    
    return () => clearInterval(interval)
  }, [previewMode, animationSpeed])

  const handleTemplateSelect = (templateId: string) => {
    const template = PARALLAX_TEMPLATES.find(t => t.id === templateId)
    setSelectedTemplate(template || null)
  }

  const updateLayer = (layerId: string, updates: Partial<ParallaxLayer>) => {
    setCustomLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ))
  }

  const addCustomLayer = () => {
    const newLayer: ParallaxLayer = {
      id: `custom-${Date.now()}`,
      name: `Layer ${customLayers.length + 1}`,
      type: 'midground',
      prompt: '',
      depth: 0.5,
      scrollSpeed: 0.5,
      opacity: 1.0,
      generated: false,
      generating: false
    }
    setCustomLayers(prev => [...prev, newLayer])
  }

  const removeLayer = (layerId: string) => {
    setCustomLayers(prev => prev.filter(layer => layer.id !== layerId))
  }

  const generateSingleLayer = async (layer: ParallaxLayer) => {
    if (!selectedTemplate) return

    updateLayer(layer.id, { generating: true })

    try {
      const enhancedPrompt = `${layer.prompt}. Style: ${selectedTemplate.style}. 
        Parallax layer for game background. Depth level: ${layer.depth}. 
        Seamless horizontal tiling. Transparent background where appropriate.
        Game-ready asset optimized for parallax scrolling.`

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          newProjectName: createNewProject ? newProjectName.trim() : null,
          prompt: enhancedPrompt,
          parameters: {
            ...selectedTemplate.defaultParameters,
            asset_type: 'parallax-background',
            layer_type: layer.type,
            layer_name: layer.name,
            depth_factor: layer.depth,
            scroll_speed: layer.scrollSpeed
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        updateLayer(layer.id, { 
          generated: true, 
          generating: false, 
          imageUrl: result.asset.image_url 
        })
      } else {
        throw new Error(result.error || 'Generation failed')
      }
    } catch (error) {
      console.error('Layer generation error:', error)
      updateLayer(layer.id, { generating: false })
    }
  }

  const generateAllLayers = async () => {
    if (!selectedTemplate || !customLayers.length) return
    
    setIsGenerating(true)

    try {
      // Generate layers sequentially to avoid overwhelming the API
      for (const layer of customLayers) {
        if (!layer.generated) {
          await generateSingleLayer(layer)
          // Small delay between layers
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Create the final parallax asset record
      const response = await fetch("/api/parallax/create", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          newProjectName: createNewProject ? newProjectName.trim() : null,
          templateId: selectedTemplate.id,
          layers: customLayers.filter(layer => layer.generated)
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setGeneratedAsset(result.asset)
        onAssetGenerated?.(result.asset)
      }
    } catch (error) {
      console.error('Parallax generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getLayerIcon = (type: ParallaxLayer['type']) => {
    switch (type) {
      case 'sky': return <Cloud className="w-4 h-4" />
      case 'background': return <Mountain className="w-4 h-4" />
      case 'midground': return <TreePine className="w-4 h-4" />
      case 'foreground': return <TreePine className="w-4 h-4" />
      case 'ground': return <Layers className="w-4 h-4" />
      default: return <Layers className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="w-6 h-6" />
          Parallax Background Generator
        </h2>
        <p className="text-muted-foreground">
          Create professional multi-layer parallax backgrounds for your games
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection & Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Template</CardTitle>
              <CardDescription>
                Start with a pre-built template or create your own layers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PARALLAX_TEMPLATES.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id 
                        ? 'ring-2 ring-primary border-primary' 
                        : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="secondary">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {template.layers.length} layers
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Layer Configuration */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Layer Configuration</CardTitle>
                    <CardDescription>
                      Customize each parallax layer
                    </CardDescription>
                  </div>
                  <Button onClick={addCustomLayer} variant="outline" size="sm">
                    Add Layer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {customLayers.map((layer, index) => (
                      <Card key={layer.id} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getLayerIcon(layer.type)}
                              <Input
                                value={layer.name}
                                onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
                                className="font-medium w-32"
                              />
                              <Badge variant="outline">{layer.type}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => generateSingleLayer(layer)}
                                disabled={layer.generating || isGenerating}
                                size="sm"
                                variant={layer.generated ? "secondary" : "default"}
                              >
                                {layer.generating ? (
                                  <Sparkles className="w-4 h-4 animate-spin" />
                                ) : layer.generated ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <Wand2 className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                onClick={() => removeLayer(layer.id)}
                                disabled={isGenerating}
                                size="sm"
                                variant="ghost"
                              >
                                ×
                              </Button>
                            </div>
                          </div>

                          <Textarea
                            value={layer.prompt}
                            onChange={(e) => updateLayer(layer.id, { prompt: e.target.value })}
                            placeholder="Describe this layer..."
                            className="min-h-16"
                          />

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs">Depth: {layer.depth}</Label>
                              <Slider
                                value={[layer.depth]}
                                onValueChange={([value]) => updateLayer(layer.id, { depth: value })}
                                min={0.1}
                                max={1.0}
                                step={0.1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Speed: {layer.scrollSpeed}</Label>
                              <Slider
                                value={[layer.scrollSpeed]}
                                onValueChange={([value]) => updateLayer(layer.id, { scrollSpeed: value })}
                                min={0.1}
                                max={1.0}
                                step={0.1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Opacity: {layer.opacity}</Label>
                              <Slider
                                value={[layer.opacity]}
                                onValueChange={([value]) => updateLayer(layer.id, { opacity: value })}
                                min={0.1}
                                max={1.0}
                                step={0.1}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Generation Controls & Preview */}
        <div className="space-y-6">
          {/* Project Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Project</Label>
                <Switch
                  checked={createNewProject}
                  onCheckedChange={setCreateNewProject}
                />
              </div>

              {createNewProject ? (
                <Input
                  placeholder="New project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              ) : (
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Generation Controls */}
          <Card>
            <CardContent className="p-6">
              <Button
                onClick={generateAllLayers}
                disabled={!selectedTemplate || isGenerating || (!selectedProject && !createNewProject)}
                className="w-full h-12"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating Parallax...
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4 mr-2" />
                    Generate Parallax Background
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Controls */}
          {customLayers.some(layer => layer.generated) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => setPreviewMode(!previewMode)}
                    variant="outline"
                    size="sm"
                  >
                    {previewMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => setScrollOffset(0)}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Animation Speed</Label>
                  <Slider
                    value={[animationSpeed]}
                    onValueChange={([value]) => setAnimationSpeed(value)}
                    min={0.1}
                    max={3.0}
                    step={0.1}
                  />
                </div>

                <div className="relative h-32 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg overflow-hidden">
                  {customLayers
                    .filter(layer => layer.generated && layer.imageUrl)
                    .sort((a, b) => a.depth - b.depth)
                    .map((layer) => (
                      <div
                        key={layer.id}
                        className="absolute inset-0"
                        style={{
                          transform: `translateX(${-scrollOffset * layer.scrollSpeed}px)`,
                          opacity: layer.opacity,
                          zIndex: Math.floor(layer.depth * 10)
                        }}
                      >
                        <img
                          src={layer.imageUrl}
                          alt={layer.name}
                          className="h-full w-auto object-cover"
                          style={{ imageRendering: selectedTemplate?.style.includes('pixel') ? 'pixelated' : 'auto' }}
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
