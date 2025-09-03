"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/luxe-ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  PlayIcon, 
  PlusIcon, 
  RefreshCwIcon,
  SettingsIcon,
  GridIcon,
  LayersIcon,
  PaletteIcon,
  SparklesIcon
} from 'lucide-react'
import { SpriteWorkflow, SpriteWorkflowFrame, ANIMATION_TEMPLATES } from '@/lib/types/sprite-workflow'

interface SpriteWorkflowEditorProps {
  workflow?: SpriteWorkflow
  onWorkflowChange?: (workflow: SpriteWorkflow) => void
  onGenerate?: (workflow: SpriteWorkflow) => void
}

export function SpriteWorkflowEditor({ 
  workflow, 
  onWorkflowChange, 
  onGenerate 
}: SpriteWorkflowEditorProps) {
  const [activeTab, setActiveTab] = useState('setup')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  
  // Initialize default workflow
  const [currentWorkflow, setCurrentWorkflow] = useState<SpriteWorkflow>(workflow || {
    id: '',
    name: 'New Sprite Animation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: '',
    sprite_sheet: {
      style: 'Pixel art',
      canvas: {
        size: '64x64 pixels',
        background: 'transparent',
        consistency: 'same pose alignment, proportions, and framing across all frames'
      },
      character: {
        identity: 'A wizard with long white beard, blue robe, and staff',
        base_pose: 'frontal view, full body'
      },
      animation: {
        title: 'Casting Fireball Spell',
        stages: ANIMATION_TEMPLATES.spell_casting.stages
      },
      frames: []
    },
    settings: {
      model: 'gemini',
      quality: 'standard',
      batch_size: 3,
      auto_generate: false
    },
    export: {
      format: 'sprite_sheet',
      resolution: '64x64'
    },
    status: 'draft',
    progress: {
      completed_frames: 0,
      total_frames: 9
    }
  })

  const updateWorkflow = (updates: Partial<SpriteWorkflow>) => {
    const updated = { ...currentWorkflow, ...updates }
    setCurrentWorkflow(updated)
    onWorkflowChange?.(updated)
  }

  const generateFrames = () => {
    const frames: SpriteWorkflowFrame[] = []
    const { stages } = currentWorkflow.sprite_sheet.animation
    
    // Generate 9 frames distributed across 5 stages
    const frameDistribution = [2, 2, 2, 2, 1] // frames per stage
    let frameNumber = 1
    
    stages.forEach((stage, stageIndex) => {
      const framesInStage = frameDistribution[stageIndex] || 1
      
      for (let i = 0; i < framesInStage; i++) {
        frames.push({
          frame_number: frameNumber,
          stage: stage.stage_number,
          description: `${stage.description} - frame ${i + 1}`,
          status: 'idle'
        })
        frameNumber++
      }
    })
    
    updateWorkflow({
      sprite_sheet: {
        ...currentWorkflow.sprite_sheet,
        frames
      }
    })
  }

  const handleGenerate = async () => {
    updateWorkflow({ status: 'generating' })
    
    // Mark frames as generating
    const updatedFrames = currentWorkflow.sprite_sheet.frames.map(frame => ({
      ...frame,
      status: 'generating' as const
    }))
    
    updateWorkflow({
      sprite_sheet: {
        ...currentWorkflow.sprite_sheet,
        frames: updatedFrames
      }
    })
    
    onGenerate?.(currentWorkflow)
  }

  const applyTemplate = (templateKey: string) => {
    const template = ANIMATION_TEMPLATES[templateKey as keyof typeof ANIMATION_TEMPLATES]
    if (template) {
      updateWorkflow({
        sprite_sheet: {
          ...currentWorkflow.sprite_sheet,
          animation: {
            ...currentWorkflow.sprite_sheet.animation,
            title: template.title,
            stages: template.stages
          }
        }
      })
      setSelectedTemplate(templateKey)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Sprite Animation Workflow
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Create consistent sprite animations with staged generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`
            ${currentWorkflow.status === 'draft' ? 'bg-gray-50 text-gray-700' : ''}
            ${currentWorkflow.status === 'generating' ? 'bg-blue-50 text-blue-700' : ''}
            ${currentWorkflow.status === 'completed' ? 'bg-green-50 text-green-700' : ''}
          `}>
            {currentWorkflow.status}
          </Badge>
          <Button onClick={handleGenerate} disabled={currentWorkflow.sprite_sheet.frames.length === 0}>
            {currentWorkflow.status === 'generating' ? (
              <>
                <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4 mr-2" />
                Generate Frames
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="stages">Stages</TabsTrigger>
          <TabsTrigger value="frames">Frames</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Character Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PaletteIcon className="w-4 h-4" />
                  Character & Style
                </CardTitle>
                <CardDescription>
                  Define the character identity and visual style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="character-identity">Character Description</Label>
                  <Textarea
                    id="character-identity"
                    value={currentWorkflow.sprite_sheet.character.identity}
                    onChange={(e) => updateWorkflow({
                      sprite_sheet: {
                        ...currentWorkflow.sprite_sheet,
                        character: {
                          ...currentWorkflow.sprite_sheet.character,
                          identity: e.target.value
                        }
                      }
                    })}
                    placeholder="e.g., A wizard with long white beard, blue robe, and staff"
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="base-pose">Base Pose</Label>
                  <Input
                    id="base-pose"
                    value={currentWorkflow.sprite_sheet.character.base_pose}
                    onChange={(e) => updateWorkflow({
                      sprite_sheet: {
                        ...currentWorkflow.sprite_sheet,
                        character: {
                          ...currentWorkflow.sprite_sheet.character,
                          base_pose: e.target.value
                        }
                      }
                    })}
                    placeholder="e.g., frontal view, full body"
                  />
                </div>
                <div>
                  <Label htmlFor="art-style">Art Style</Label>
                  <Select
                    value={currentWorkflow.sprite_sheet.style}
                    onValueChange={(value) => updateWorkflow({
                      sprite_sheet: {
                        ...currentWorkflow.sprite_sheet,
                        style: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pixel art">Pixel Art</SelectItem>
                      <SelectItem value="Hand-drawn">Hand-drawn</SelectItem>
                      <SelectItem value="Vector">Vector</SelectItem>
                      <SelectItem value="Low-poly 3D">Low-poly 3D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Canvas Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GridIcon className="w-4 h-4" />
                  Canvas Settings
                </CardTitle>
                <CardDescription>
                  Configure the sprite frame dimensions and consistency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="canvas-size">Frame Size</Label>
                  <Select
                    value={currentWorkflow.sprite_sheet.canvas.size}
                    onValueChange={(value) => updateWorkflow({
                      sprite_sheet: {
                        ...currentWorkflow.sprite_sheet,
                        canvas: {
                          ...currentWorkflow.sprite_sheet.canvas,
                          size: value
                        }
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="32x32 pixels">32x32 pixels</SelectItem>
                      <SelectItem value="64x64 pixels">64x64 pixels</SelectItem>
                      <SelectItem value="128x128 pixels">128x128 pixels</SelectItem>
                      <SelectItem value="256x256 pixels">256x256 pixels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="background">Background</Label>
                  <Select
                    value={currentWorkflow.sprite_sheet.canvas.background}
                    onValueChange={(value) => updateWorkflow({
                      sprite_sheet: {
                        ...currentWorkflow.sprite_sheet,
                        canvas: {
                          ...currentWorkflow.sprite_sheet.canvas,
                          background: value
                        }
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transparent">Transparent</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="consistency">Consistency Rules</Label>
                  <Textarea
                    id="consistency"
                    value={currentWorkflow.sprite_sheet.canvas.consistency}
                    onChange={(e) => updateWorkflow({
                      sprite_sheet: {
                        ...currentWorkflow.sprite_sheet,
                        canvas: {
                          ...currentWorkflow.sprite_sheet.canvas,
                          consistency: e.target.value
                        }
                      }
                    })}
                    placeholder="Guidelines for maintaining visual consistency across frames"
                    className="min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Animation Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Animation Templates</CardTitle>
              <CardDescription>
                Choose a pre-built animation template or create custom stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(ANIMATION_TEMPLATES).map(([key, template]) => (
                  <Button
                    key={key}
                    variant={selectedTemplate === key ? "default" : "outline"}
                    onClick={() => applyTemplate(key)}
                    className="h-auto p-3 flex-col items-start"
                  >
                    <div className="font-medium text-sm">{template.title}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {template.stages.length} stages
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stages Tab */}
        <TabsContent value="stages" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Animation Stages</h3>
            <Input
              value={currentWorkflow.sprite_sheet.animation.title}
              onChange={(e) => updateWorkflow({
                sprite_sheet: {
                  ...currentWorkflow.sprite_sheet,
                  animation: {
                    ...currentWorkflow.sprite_sheet.animation,
                    title: e.target.value
                  }
                }
              })}
              className="w-64"
              placeholder="Animation title"
            />
          </div>
          
          <div className="grid gap-4">
            {currentWorkflow.sprite_sheet.animation.stages.map((stage, index) => (
              <Card key={stage.stage_number}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-medium">
                        {stage.stage_number}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {stage.label}
                        </Badge>
                      </div>
                      <Textarea
                        value={stage.description}
                        onChange={(e) => {
                          const updatedStages = [...currentWorkflow.sprite_sheet.animation.stages]
                          updatedStages[index] = { ...stage, description: e.target.value }
                          updateWorkflow({
                            sprite_sheet: {
                              ...currentWorkflow.sprite_sheet,
                              animation: {
                                ...currentWorkflow.sprite_sheet.animation,
                                stages: updatedStages
                              }
                            }
                          })
                        }}
                        placeholder={`Describe what happens in the ${stage.label.toLowerCase()} stage...`}
                        className="min-h-[60px] resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={generateFrames} className="w-full">
            <LayersIcon className="w-4 h-4 mr-2" />
            Generate Frame Breakdown
          </Button>
        </TabsContent>

        {/* Frames Tab */}
        <TabsContent value="frames" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Animation Frames ({currentWorkflow.sprite_sheet.frames.length})
            </h3>
            {currentWorkflow.sprite_sheet.frames.length > 0 && (
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {currentWorkflow.progress.completed_frames} / {currentWorkflow.progress.total_frames} completed
              </div>
            )}
          </div>

          {currentWorkflow.sprite_sheet.frames.length === 0 ? (
            <Card className="p-8 text-center">
              <CardContent>
                <LayersIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  No frames generated yet. Set up your animation stages first, then generate frames.
                </p>
                <Button onClick={generateFrames}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Generate Frames
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-96">
              <div className="grid gap-3">
                {currentWorkflow.sprite_sheet.frames.map((frame) => {
                  const stage = currentWorkflow.sprite_sheet.animation.stages.find(s => s.stage_number === frame.stage)
                  
                  return (
                    <Card key={frame.frame_number}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-medium">
                              {frame.frame_number}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {stage?.label || `Stage ${frame.stage}`}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${
                                frame.status === 'idle' ? 'bg-gray-50 text-gray-700' :
                                frame.status === 'generating' ? 'bg-blue-50 text-blue-700' :
                                frame.status === 'completed' ? 'bg-green-50 text-green-700' :
                                'bg-red-50 text-red-700'
                              }`}>
                                {frame.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300">
                              {frame.description}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Button size="sm" variant="ghost">
                              <SettingsIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
              <CardDescription>Configure how your sprite sheet will be exported</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select
                    value={currentWorkflow.export.format}
                    onValueChange={(value: any) => updateWorkflow({
                      export: {
                        ...currentWorkflow.export,
                        format: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sprite_sheet">Single Sprite Sheet</SelectItem>
                      <SelectItem value="png_sequence">PNG Sequence</SelectItem>
                      <SelectItem value="gif">Animated GIF</SelectItem>
                      <SelectItem value="unity_package">Unity Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="resolution">Resolution</Label>
                  <Select
                    value={currentWorkflow.export.resolution}
                    onValueChange={(value) => updateWorkflow({
                      export: {
                        ...currentWorkflow.export,
                        resolution: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="64x64">64x64</SelectItem>
                      <SelectItem value="128x128">128x128</SelectItem>
                      <SelectItem value="256x256">256x256</SelectItem>
                      <SelectItem value="512x512">512x512</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
