"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/luxe-ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { 
  GridIcon, 
  PlayIcon, 
  SettingsIcon, 
  EyeIcon, 
  DownloadIcon, 
  PlusIcon,
  LoaderIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LayersIcon,
  WandIcon
} from "@/components/rounded-icons/icons"
import { SpriteSheetGrid } from "./sprite-sheet-grid"
import { FrameEditor } from "./frame-editor"
import { SpriteSheetPreview } from "./sprite-sheet-preview"
import { TemplateSelector } from "./template-selector"
import type { 
  SpriteSheet, 
  SpriteSheetFrame, 
  SpriteSheetTemplate,
  SpriteSheetBaseCharacter,
  CreateSpriteSheetRequest,
  WorldStyle,
  AssetProject
} from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface SpriteSheetCreatorProps {
  projects: AssetProject[]
  worldStyles: WorldStyle[]
  templates: SpriteSheetTemplate[]
  onSpriteSheetCreated?: (spriteSheet: SpriteSheet) => void
}

export function SpriteSheetCreator({ 
  projects, 
  worldStyles, 
  templates,
  onSpriteSheetCreated 
}: SpriteSheetCreatorProps) {
  const [currentStep, setCurrentStep] = useState<"setup" | "design" | "generate" | "preview">("setup")
  const [spriteSheet, setSpriteSheet] = useState<SpriteSheet | null>(null)
  const [selectedFrame, setSelectedFrame] = useState<SpriteSheetFrame | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  
  // Setup form state
  const [setupForm, setSetupForm] = useState({
    name: "",
    description: "",
    project_id: "",
    world_style_id: "",
    template_id: "",
    base_character: {
      description: "",
      art_style: "pixel" as const,
      character_type: "humanoid" as const,
      base_properties: {
        body_type: "medium",
        skin_tone: "medium",
        hair_color: "brown",
        clothing_style: "casual",
        default_expression: "neutral"
      }
    } as SpriteSheetBaseCharacter,
    dimensions: { rows: 4, cols: 4 },
    frame_size: { width: 64, height: 64 },
    output_settings: {
      background: "transparent" as const,
      format: "png" as const,
      spacing: 2,
      border: 1,
      quality: "high" as const,
      optimization: "game_ready" as const
    }
  })

  const supabase = createClient()

  // Handle template selection
  const handleTemplateSelect = (template: SpriteSheetTemplate) => {
    setSetupForm(prev => ({
      ...prev,
      template_id: template.id,
      dimensions: template.dimensions,
      frame_size: template.frame_size
    }))
  }

  // Create new sprite sheet
  const handleCreateSpriteSheet = async () => {
    if (!setupForm.name || !setupForm.base_character.description) {
      alert("Please fill in required fields")
      return
    }

    setIsCreating(true)
    try {
      const request: CreateSpriteSheetRequest = {
        name: setupForm.name,
        description: setupForm.description,
        project_id: setupForm.project_id || undefined,
        world_style_id: setupForm.world_style_id || undefined,
        base_character: setupForm.base_character,
        dimensions: setupForm.dimensions,
        frame_size: setupForm.frame_size,
        output_settings: setupForm.output_settings,
        template_id: setupForm.template_id || undefined
      }

      // Create sprite sheet via API route
      const response = await fetch('/api/sprite-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create sprite sheet')
      }

      const { sprite_sheet: createdSpriteSheet } = await response.json()

      setSpriteSheet(createdSpriteSheet)
      setCurrentStep("design")
      onSpriteSheetCreated?.(createdSpriteSheet)

    } catch (error) {
      console.error('Error creating sprite sheet:', error)
      alert(`Failed to create sprite sheet: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setIsCreating(false)
    }
  }

  // Generate sprite sheet frames
  const handleGenerateSpriteSheet = async () => {
    if (!spriteSheet) return

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      // Start generation process
      const response = await fetch('/api/sprite-sheets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprite_sheet_id: spriteSheet.id,
          priority: 'quality'
        })
      })

      if (!response.ok) throw new Error('Generation failed')

      // Poll for progress updates
      const pollProgress = setInterval(async () => {
        const { data: updated } = await supabase
          .from('sprite_sheets')
          .select('generation_progress, status')
          .eq('id', spriteSheet.id)
          .single()

        if (updated) {
          const progress = (updated.generation_progress.completed_frames / updated.generation_progress.total_frames) * 100
          setGenerationProgress(progress)

          if (updated.status === 'completed' || updated.status === 'error') {
            clearInterval(pollProgress)
            setIsGenerating(false)
            
            if (updated.status === 'completed') {
              setCurrentStep("preview")
              // Refresh sprite sheet data
              const { data: refreshed } = await supabase
                .from('sprite_sheets')
                .select(`*, frames:sprite_sheet_frames(*)`)
                .eq('id', spriteSheet.id)
                .single()
              
              if (refreshed) setSpriteSheet(refreshed)
            }
          }
        }
      }, 2000)

    } catch (error) {
      console.error('Error generating sprite sheet:', error)
      alert('Failed to generate sprite sheet. Please try again.')
      setIsGenerating(false)
    }
  }

  // Handle frame selection
  const handleFrameSelect = (frame: SpriteSheetFrame) => {
    setSelectedFrame(frame)
  }

  // Handle frame property updates
  const handleFrameUpdate = async (frameId: string, properties: any) => {
    if (!spriteSheet) return

    try {
      const { error } = await supabase
        .from('sprite_sheet_frames')
        .update({ properties })
        .eq('id', frameId)

      if (error) throw error

      // Update local state
      setSpriteSheet(prev => prev ? {
        ...prev,
        frames: prev.frames.map(frame => 
          frame.id === frameId 
            ? { ...frame, properties: { ...frame.properties, ...properties } }
            : frame
        )
      } : null)

    } catch (error) {
      console.error('Error updating frame:', error)
    }
  }

  const getStepStatus = (step: string) => {
    if (currentStep === step) return "active"
    if (
      (step === "setup" && ["design", "generate", "preview"].includes(currentStep)) ||
      (step === "design" && ["generate", "preview"].includes(currentStep)) ||
      (step === "generate" && currentStep === "preview")
    ) return "completed"
    return "pending"
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Sprite Sheet Creator
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Create animated character sprites with frame-by-frame control
          </p>
        </div>

        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { key: "setup", label: "Setup", icon: SettingsIcon },
              { key: "design", label: "Design", icon: GridIcon },
              { key: "generate", label: "Generate", icon: WandIcon },
              { key: "preview", label: "Preview", icon: EyeIcon }
            ].map((step, index) => {
              const status = getStepStatus(step.key)
              const Icon = step.icon
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 
                    ${status === "active" ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-black" : ""}
                    ${status === "completed" ? "border-green-500 bg-green-500 text-white" : ""}
                    ${status === "pending" ? "border-neutral-300 bg-neutral-100 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800" : ""}
                  `}>
                    {status === "completed" ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`ml-2 font-medium ${
                    status === "active" ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-500"
                  }`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className={`flex-1 h-px mx-4 ${
                      getStepStatus(["setup", "design", "generate", "preview"][index + 1]) !== "pending" 
                        ? "bg-green-500" 
                        : "bg-neutral-300 dark:bg-neutral-700"
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === "setup" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    Sprite Sheet Setup
                  </CardTitle>
                  <CardDescription>
                    Configure your sprite sheet dimensions and base character
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={setupForm.name}
                        onChange={(e) => setSetupForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="My Character Sprite Sheet"
                      />
                    </div>
                    <div>
                      <Label htmlFor="project">Project</Label>
                      <Select
                        value={setupForm.project_id}
                        onValueChange={(value) => setSetupForm(prev => ({ ...prev, project_id: value }))}
                      >
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
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={setupForm.description}
                      onChange={(e) => setSetupForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your sprite sheet..."
                    />
                  </div>

                  {/* Template Selection */}
                  <div>
                    <Label>Quick Start Templates</Label>
                    <TemplateSelector
                      templates={templates}
                      selectedTemplate={setupForm.template_id}
                      onTemplateSelect={handleTemplateSelect}
                    />
                  </div>

                  {/* Character Configuration */}
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Base Character</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="char-description">Character Description *</Label>
                        <Textarea
                          id="char-description"
                          value={setupForm.base_character.description}
                          onChange={(e) => setSetupForm(prev => ({
                            ...prev,
                            base_character: { ...prev.base_character, description: e.target.value }
                          }))}
                          placeholder="A brave knight with silver armor..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Art Style</Label>
                          <Select
                            value={setupForm.base_character.art_style}
                            onValueChange={(value: any) => setSetupForm(prev => ({
                              ...prev,
                              base_character: { ...prev.base_character, art_style: value }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pixel">Pixel Art</SelectItem>
                              <SelectItem value="cartoon">Cartoon</SelectItem>
                              <SelectItem value="realistic">Realistic</SelectItem>
                              <SelectItem value="anime">Anime</SelectItem>
                              <SelectItem value="chibi">Chibi</SelectItem>
                              <SelectItem value="low_poly">Low Poly</SelectItem>
                              <SelectItem value="hand_drawn">Hand Drawn</SelectItem>
                              <SelectItem value="vector">Vector</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Character Type</Label>
                          <Select
                            value={setupForm.base_character.character_type}
                            onValueChange={(value: any) => setSetupForm(prev => ({
                              ...prev,
                              base_character: { ...prev.base_character, character_type: value }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="humanoid">Humanoid</SelectItem>
                              <SelectItem value="creature">Creature</SelectItem>
                              <SelectItem value="robot">Robot</SelectItem>
                              <SelectItem value="animal">Animal</SelectItem>
                              <SelectItem value="fantasy_being">Fantasy Being</SelectItem>
                              <SelectItem value="monster">Monster</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Sprite Sheet Dimensions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Rows</Label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={setupForm.dimensions.rows}
                          onChange={(e) => setSetupForm(prev => ({
                            ...prev,
                            dimensions: { ...prev.dimensions, rows: parseInt(e.target.value) || 1 }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Columns</Label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={setupForm.dimensions.cols}
                          onChange={(e) => setSetupForm(prev => ({
                            ...prev,
                            dimensions: { ...prev.dimensions, cols: parseInt(e.target.value) || 1 }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Frame Width</Label>
                        <Input
                          type="number"
                          min="16"
                          max="512"
                          value={setupForm.frame_size.width}
                          onChange={(e) => setSetupForm(prev => ({
                            ...prev,
                            frame_size: { ...prev.frame_size, width: parseInt(e.target.value) || 64 }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Frame Height</Label>
                        <Input
                          type="number"
                          min="16"
                          max="512"
                          value={setupForm.frame_size.height}
                          onChange={(e) => setSetupForm(prev => ({
                            ...prev,
                            frame_size: { ...prev.frame_size, height: parseInt(e.target.value) || 64 }
                          }))}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-neutral-500 mt-2">
                      Total frames: {setupForm.dimensions.rows * setupForm.dimensions.cols}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleCreateSpriteSheet}
                      disabled={isCreating || !setupForm.name || !setupForm.base_character.description}
                      className="flex items-center gap-2"
                    >
                      {isCreating ? (
                        <>
                          <LoaderIcon className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-4 h-4" />
                          Create Sprite Sheet
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {(currentStep === "design" || currentStep === "generate") && spriteSheet && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GridIcon className="w-5 h-5" />
                      {spriteSheet.name}
                    </CardTitle>
                    <CardDescription>
                      Click on frames to edit their properties
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SpriteSheetGrid
                      spriteSheet={spriteSheet}
                      selectedFrame={selectedFrame}
                      onFrameSelect={handleFrameSelect}
                    />
                  </CardContent>
                </Card>

                {currentStep === "generate" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <WandIcon className="w-5 h-5" />
                        Generate Frames
                      </CardTitle>
                      <CardDescription>
                        Generate AI artwork for your sprite sheet frames
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isGenerating ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <LoaderIcon className="w-5 h-5 animate-spin" />
                            <span>Generating frames...</span>
                          </div>
                          <Progress value={generationProgress} className="w-full" />
                          <p className="text-sm text-neutral-500">
                            {Math.round(generationProgress)}% complete
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={handleGenerateSpriteSheet}
                            className="flex items-center gap-2"
                            variant="elevated"
                          >
                            <WandIcon className="w-4 h-4" />
                            Generate All Frames
                          </Button>
                          <Button
                            onClick={() => setCurrentStep("preview")}
                            variant="smooth"
                            className="flex items-center gap-2"
                          >
                            <EyeIcon className="w-4 h-4" />
                            Preview
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {currentStep === "preview" && spriteSheet && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <EyeIcon className="w-5 h-5" />
                    Sprite Sheet Preview
                  </CardTitle>
                  <CardDescription>
                    Preview and export your completed sprite sheet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SpriteSheetPreview spriteSheet={spriteSheet} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Step Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { key: "setup", label: "Setup" },
                  { key: "design", label: "Design" },
                  { key: "generate", label: "Generate" },
                  { key: "preview", label: "Preview" }
                ].map((step) => (
                  <Button
                    key={step.key}
                    variant={currentStep === step.key ? "elevated" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      if (spriteSheet || step.key === "setup") {
                        setCurrentStep(step.key as any)
                      }
                    }}
                    disabled={!spriteSheet && step.key !== "setup"}
                  >
                    {step.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Frame Editor */}
            {selectedFrame && currentStep === "design" && (
              <FrameEditor
                frame={selectedFrame}
                spriteSheet={spriteSheet!}
                onFrameUpdate={handleFrameUpdate}
              />
            )}

            {/* Generation Progress */}
            {spriteSheet && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completed Frames</span>
                      <span>
                        {spriteSheet.generation_progress.completed_frames} / {spriteSheet.generation_progress.total_frames}
                      </span>
                    </div>
                    <Progress 
                      value={(spriteSheet.generation_progress.completed_frames / spriteSheet.generation_progress.total_frames) * 100} 
                    />
                    <Badge variant={
                      spriteSheet.status === "completed" ? "default" : 
                      spriteSheet.status === "generating" ? "secondary" : 
                      "outline"
                    }>
                      {spriteSheet.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
