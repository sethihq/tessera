"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-client"
import type { AssetProject } from "@/lib/db"
import { ArrowLeft, ImageIcon, Loader2, Sparkles, Wand2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FileUpload } from "@/components/ui/file-upload"

interface GenerationParameters {
  style?: string
  quality?: "standard" | "hd"
  size?: "1024x1024" | "1792x1024" | "1024x1792"
  batch_size?: number
}

interface GenerateContentProps {
  projects: AssetProject[]
}

export function GenerateContent({ projects }: GenerateContentProps) {
  const { user } = useAuth()
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [newProjectName, setNewProjectName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [styleReference, setStyleReference] = useState<File | null>(null)
  const [parameters, setParameters] = useState<GenerationParameters>({
    style: "realistic",
    quality: "standard",
    size: "1024x1024",
    batch_size: 1,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [createNewProject, setCreateNewProject] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return

    setIsGenerating(true)

    try {
      const projectId = selectedProject

      // Upload style reference if provided
      let styleReferenceUrl = null
      if (styleReference) {
        // Convert file to base64 for API transmission
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(styleReference)
        })
        styleReferenceUrl = await base64Promise
      }

      // Generate assets via API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          newProjectName: createNewProject ? newProjectName.trim() : null,
          prompt,
          styleReferenceUrl,
          parameters,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Generation failed")
      }

      const result = await response.json()

      // Redirect to the generated asset or project
      if (result.projectId) {
        router.push(`/dashboard/projects/${result.projectId}`)
      } else {
        router.push("/dashboard/assets")
      }
    } catch (error) {
      console.error("Generation error:", error)
      // Handle error (show toast, etc.)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Generate Assets</h1>
            <p className="text-slate-600 dark:text-slate-400">Create stunning game assets with AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Generation Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Asset Generation
                </CardTitle>
                <CardDescription>Describe what you want to create and let AI bring it to life</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Project</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={createNewProject}
                        onCheckedChange={setCreateNewProject}
                        id="create-new-project"
                      />
                      <Label htmlFor="create-new-project" className="text-sm">
                        Create new project
                      </Label>
                    </div>
                  </div>

                  {createNewProject ? (
                    <Input
                      placeholder="Enter project name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="h-11"
                    />
                  ) : (
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a project" />
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
                </div>

                {/* Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-base font-medium">
                    Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the asset you want to generate... (e.g., 'A medieval sword with glowing runes, fantasy style, high detail')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-24 resize-none"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Be specific about style, colors, and details for best results
                  </p>
                </div>

                {/* Style Reference Upload */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Style Reference (Optional)</Label>
                  <FileUpload
                    accept="image/*"
                    onFileSelect={setStyleReference}
                    selectedFile={styleReference}
                    className="h-32"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload an image to guide the AI's style and aesthetic
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Generation Parameters */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Generation Settings</CardTitle>
                <CardDescription>Fine-tune your asset generation parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Style</Label>
                        <Select
                          value={parameters.style}
                          onValueChange={(value) => setParameters({ ...parameters, style: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realistic">Realistic</SelectItem>
                            <SelectItem value="cartoon">Cartoon</SelectItem>
                            <SelectItem value="anime">Anime</SelectItem>
                            <SelectItem value="pixel-art">Pixel Art</SelectItem>
                            <SelectItem value="fantasy">Fantasy</SelectItem>
                            <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Quality</Label>
                        <Select
                          value={parameters.quality}
                          onValueChange={(value: "standard" | "hd") => setParameters({ ...parameters, quality: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="hd">HD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Size</Label>
                        <Select
                          value={parameters.size}
                          onValueChange={(value: "1024x1024" | "1792x1024" | "1024x1792") =>
                            setParameters({ ...parameters, size: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1024x1024">Square (1024×1024)</SelectItem>
                            <SelectItem value="1792x1024">Landscape (1792×1024)</SelectItem>
                            <SelectItem value="1024x1792">Portrait (1024×1792)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Batch Size</Label>
                        <Select
                          value={parameters.batch_size?.toString()}
                          onValueChange={(value) =>
                            setParameters({ ...parameters, batch_size: Number.parseInt(value) })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Asset</SelectItem>
                            <SelectItem value="2">2 Assets</SelectItem>
                            <SelectItem value="4">4 Assets</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Generate Button */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating || (!selectedProject && !createNewProject)}
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Asset
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-base">💡 Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Be specific</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Include details about style, colors, materials, and mood
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Use references</p>
                  <p className="text-slate-600 dark:text-slate-400">Upload style references for better consistency</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Iterate</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Generate multiple variations to find the perfect asset
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Generations */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-base">Recent Generations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-md flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          Fantasy sword #{i}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
