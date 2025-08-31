"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Layers, Grid3X3, Package, Zap, Wand2, Eye } from "lucide-react"
import type { AssetType, WorldStyle, GenerationParameters } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface AssetTypeGeneratorProps {
  projects: any[]
  worldStyles: WorldStyle[]
  selectedWorldStyle?: WorldStyle
  onGenerate: (params: any) => Promise<void>
  isGenerating: boolean
}

export function AssetTypeGenerator({
  projects,
  worldStyles,
  selectedWorldStyle,
  onGenerate,
  isGenerating,
}: AssetTypeGeneratorProps) {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([])
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null)
  const [generateForm, setGenerateForm] = useState({
    prompt: "",
    projectId: "",
    newProjectName: "",
    worldStyleId: selectedWorldStyle?.id || "default",
  })
  const [parameters, setParameters] = useState<GenerationParameters>({})

  const supabase = createClient()

  useEffect(() => {
    fetchAssetTypes()
  }, [])

  useEffect(() => {
    if (selectedWorldStyle) {
      setGenerateForm((prev) => ({ ...prev, worldStyleId: selectedWorldStyle.id }))
    }
  }, [selectedWorldStyle])

  const fetchAssetTypes = async () => {
    try {
      const { data, error } = await supabase.from("asset_types").select("*").order("name")

      if (error) throw error
      setAssetTypes(data || [])

      // Select first asset type by default
      if (data && data.length > 0) {
        setSelectedAssetType(data[0])
        setParameters(data[0].default_parameters || {})
      }
    } catch (error) {
      console.error("Error fetching asset types:", error)
    }
  }

  const handleAssetTypeChange = (assetType: AssetType) => {
    setSelectedAssetType(assetType)
    setParameters(assetType.default_parameters || {})
  }

  const handleGenerate = async () => {
    if (!generateForm.prompt.trim() || !selectedAssetType) return

    await onGenerate({
      projectId: generateForm.projectId === "new" ? null : generateForm.projectId,
      newProjectName: generateForm.projectId === "new" ? generateForm.newProjectName : null,
      prompt: generateForm.prompt,
      worldStyleId: generateForm.worldStyleId,
      assetTypeId: selectedAssetType.id,
      parameters,
    })

    // Reset form
    setGenerateForm({
      prompt: "",
      projectId: "",
      newProjectName: "",
      worldStyleId: selectedWorldStyle?.id || "default",
    })
  }

  const getAssetTypeIcon = (name: string) => {
    switch (name) {
      case "parallax":
        return <Layers className="w-4 h-4" />
      case "tileset":
        return <Grid3X3 className="w-4 h-4" />
      case "props":
        return <Package className="w-4 h-4" />
      case "fx":
        return <Zap className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const buildPrompt = () => {
    if (!selectedAssetType || !generateForm.prompt) return ""

    let prompt = generateForm.prompt

    // Add asset type context
    switch (selectedAssetType.name) {
      case "parallax":
        prompt += ` - ${parameters.layers || 3} layer parallax background, seamless scrolling`
        break
      case "tileset":
        prompt += ` - ${parameters.tile_size || "32x32"} tileset, seamless tiles`
        if (parameters.seamless) prompt += ", perfect tile edges"
        break
      case "props":
        prompt += ` - game prop object, transparent background`
        if (parameters.variations && parameters.variations > 1) {
          prompt += `, ${parameters.variations} variations`
        }
        break
      case "fx":
        prompt += ` - visual effect animation, ${parameters.frame_count || 8} frames`
        if (parameters.loop) prompt += ", looping"
        break
    }

    // Add world style context
    if (selectedWorldStyle) {
      const style = selectedWorldStyle.style_parameters
      if (style?.texture_style) prompt += `, ${style.texture_style} art style`
      if (style?.perspective) prompt += `, ${style.perspective} perspective`
      if (style?.lighting) prompt += `, ${style.lighting} lighting`
    }

    return prompt
  }

  return (
    <div className="space-y-6">
      {/* Asset Type Selection */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-[#FF6600]" />
            Asset Type
          </CardTitle>
          <CardDescription>Choose the type of game asset to generate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {assetTypes.map((assetType) => (
              <Card
                key={assetType.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedAssetType?.id === assetType.id
                    ? "border-[#FF6600] bg-[#FF6600]/5"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-[#FF6600]/50"
                }`}
                onClick={() => handleAssetTypeChange(assetType)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedAssetType?.id === assetType.id
                          ? "bg-[#FF6600] text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {getAssetTypeIcon(assetType.name)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                        {assetType.display_name}
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{assetType.category}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedAssetType && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generation Form */}
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
              <CardDescription>{selectedAssetType.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Asset Description</Label>
                <Textarea
                  id="prompt"
                  placeholder={`Describe your ${selectedAssetType.display_name.toLowerCase()}...`}
                  value={generateForm.prompt}
                  onChange={(e) => setGenerateForm((prev) => ({ ...prev, prompt: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={generateForm.projectId}
                  onValueChange={(value) => setGenerateForm((prev) => ({ ...prev, projectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Create New Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {generateForm.projectId === "new" && (
                <div className="space-y-2">
                  <Label htmlFor="newProject">New Project Name</Label>
                  <Input
                    id="newProject"
                    placeholder="Enter project name"
                    value={generateForm.newProjectName}
                    onChange={(e) => setGenerateForm((prev) => ({ ...prev, newProjectName: e.target.value }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="worldStyle">World Style</Label>
                <Select
                  value={generateForm.worldStyleId}
                  onValueChange={(value) => setGenerateForm((prev) => ({ ...prev, worldStyleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select world style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">No specific style</SelectItem>
                    {worldStyles.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Asset-Specific Parameters */}
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle>Asset Parameters</CardTitle>
              <CardDescription>Customize settings for {selectedAssetType.display_name.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  {selectedAssetType.name === "parallax" && (
                    <>
                      <div className="space-y-2">
                        <Label>Number of Layers: {parameters.layers || 3}</Label>
                        <Slider
                          value={[parameters.layers || 3]}
                          onValueChange={([value]) => setParameters((prev) => ({ ...prev, layers: value }))}
                          min={2}
                          max={6}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Depth Multiplier: {parameters.depth_multiplier || 0.5}</Label>
                        <Slider
                          value={[parameters.depth_multiplier || 0.5]}
                          onValueChange={([value]) => setParameters((prev) => ({ ...prev, depth_multiplier: value }))}
                          min={0.1}
                          max={1.0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {selectedAssetType.name === "tileset" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="tileSize">Tile Size</Label>
                        <Select
                          value={parameters.tile_size || "32x32"}
                          onValueChange={(value) => setParameters((prev) => ({ ...prev, tile_size: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16x16">16x16</SelectItem>
                            <SelectItem value="32x32">32x32</SelectItem>
                            <SelectItem value="64x64">64x64</SelectItem>
                            <SelectItem value="128x128">128x128</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="seamless"
                          checked={parameters.seamless !== false}
                          onCheckedChange={(checked) => setParameters((prev) => ({ ...prev, seamless: checked }))}
                        />
                        <Label htmlFor="seamless">Seamless Tiles</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="collision"
                          checked={parameters.collision_data === true}
                          onCheckedChange={(checked) => setParameters((prev) => ({ ...prev, collision_data: checked }))}
                        />
                        <Label htmlFor="collision">Include Collision Data</Label>
                      </div>
                    </>
                  )}

                  {selectedAssetType.name === "props" && (
                    <>
                      <div className="space-y-2">
                        <Label>Variations: {parameters.variations || 1}</Label>
                        <Slider
                          value={[parameters.variations || 1]}
                          onValueChange={([value]) => setParameters((prev) => ({ ...prev, variations: value }))}
                          min={1}
                          max={5}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="shadows"
                          checked={parameters.include_shadows !== false}
                          onCheckedChange={(checked) =>
                            setParameters((prev) => ({ ...prev, include_shadows: checked }))
                          }
                        />
                        <Label htmlFor="shadows">Include Shadows</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="transparent"
                          checked={parameters.transparent_bg !== false}
                          onCheckedChange={(checked) => setParameters((prev) => ({ ...prev, transparent_bg: checked }))}
                        />
                        <Label htmlFor="transparent">Transparent Background</Label>
                      </div>
                    </>
                  )}

                  {selectedAssetType.name === "fx" && (
                    <>
                      <div className="space-y-2">
                        <Label>Frame Count: {parameters.frame_count || 8}</Label>
                        <Slider
                          value={[parameters.frame_count || 8]}
                          onValueChange={([value]) => setParameters((prev) => ({ ...prev, frame_count: value }))}
                          min={4}
                          max={24}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Frame Rate: {parameters.frame_rate || 12} FPS</Label>
                        <Slider
                          value={[parameters.frame_rate || 12]}
                          onValueChange={([value]) => setParameters((prev) => ({ ...prev, frame_rate: value }))}
                          min={6}
                          max={30}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="loop"
                          checked={parameters.loop !== false}
                          onCheckedChange={(checked) => setParameters((prev) => ({ ...prev, loop: checked }))}
                        />
                        <Label htmlFor="loop">Looping Animation</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="spriteSheet"
                          checked={parameters.sprite_sheet !== false}
                          onCheckedChange={(checked) => setParameters((prev) => ({ ...prev, sprite_sheet: checked }))}
                        />
                        <Label htmlFor="spriteSheet">Export as Sprite Sheet</Label>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="quality">Quality</Label>
                    <Select
                      value={parameters.quality || "high"}
                      onValueChange={(value) => setParameters((prev) => ({ ...prev, quality: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="ultra">Ultra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Resolution</Label>
                    <Select
                      value={parameters.size || "1024x1024"}
                      onValueChange={(value) => setParameters((prev) => ({ ...prev, size: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="512x512">512x512</SelectItem>
                        <SelectItem value="1024x1024">1024x1024</SelectItem>
                        <SelectItem value="1792x1024">1792x1024</SelectItem>
                        <SelectItem value="1024x1792">1024x1792</SelectItem>
                        <SelectItem value="2048x2048">2048x2048</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAssetType.export_formats && (
                    <div className="space-y-2">
                      <Label>Export Formats</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedAssetType.export_formats.map((format) => (
                          <Badge key={format} variant="secondary" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prompt Preview & Generate */}
      {selectedAssetType && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#FF6600]" />
              Generation Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Enhanced Prompt</Label>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {buildPrompt() || "Enter a description to see the enhanced prompt..."}
                </p>
              </div>
            </div>

            <Separator />

            <Button
              onClick={handleGenerate}
              disabled={!generateForm.prompt.trim() || !selectedAssetType || isGenerating}
              className="w-full bg-[#FF6600] hover:bg-[#E55A00] text-white"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating {selectedAssetType.display_name}...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate {selectedAssetType.display_name}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
