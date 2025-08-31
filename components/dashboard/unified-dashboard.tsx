"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import {
  Home,
  FolderPlus,
  ImageIcon,
  Sparkles,
  Settings,
  LogOut,
  Plus,
  Search,
  Zap,
  TrendingUp,
  Calendar,
  Download,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

interface UnifiedDashboardProps {
  user: any
  profile: any
  projects: any[]
  recentAssets: any[]
}

export function UnifiedDashboard({ user, profile, projects, recentAssets }: UnifiedDashboardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateForm, setGenerateForm] = useState({
    prompt: "",
    projectId: "",
    newProjectName: "",
    styleReference: "",
    parameters: {
      style: "realistic",
      quality: "high",
      aspectRatio: "1:1",
    },
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/sign-in")
  }

  const menuItems = [
    {
      title: "Overview",
      icon: Home,
      value: "overview",
    },
    {
      title: "Projects",
      icon: FolderPlus,
      value: "projects",
    },
    {
      title: "Assets",
      icon: ImageIcon,
      value: "assets",
    },
    {
      title: "Generate",
      icon: Sparkles,
      value: "generate",
    },
  ]

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredAssets = recentAssets.filter(
    (asset) =>
      asset.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.asset_projects?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleGenerate = async () => {
    if (!generateForm.prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: generateForm.prompt,
          projectId: generateForm.projectId || null,
          newProjectName: generateForm.newProjectName || null,
          styleReferenceUrl: generateForm.styleReference || null,
          parameters: generateForm.parameters,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Reset form and switch to assets tab to show the new asset
        setGenerateForm({
          prompt: "",
          projectId: "",
          newProjectName: "",
          styleReference: "",
          parameters: {
            style: "realistic",
            quality: "high",
            aspectRatio: "1:1",
          },
        })
        setActiveTab("assets")
        // Refresh the page to show new asset
        router.refresh()
      } else {
        console.error("Generation failed:", result.error)
      }
    } catch (error) {
      console.error("Generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950">
        <Sidebar className="border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <SidebarHeader className="border-b border-neutral-200 dark:border-neutral-800 p-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">AI Asset Creator</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Create with AI</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.value}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.value)}
                        isActive={activeTab === item.value}
                        className="h-10 px-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground transition-all duration-200"
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                Account
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="h-10 px-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
                    >
                      <Link href="/dashboard/settings" className="flex items-center gap-3">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {profile?.full_name || user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start h-9 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="text-sm">Sign out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6">
            <SidebarTrigger className="hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {menuItems.find((item) => item.value === activeTab)?.title || "Dashboard"}
              </h1>
            </div>
            <Button
              onClick={() => setActiveTab("generate")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm h-9 px-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Generate Asset</span>
            </Button>
          </header>

          <main className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                {/* Welcome Section */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    Welcome back, {profile?.full_name || user.email?.split("@")[0]}!
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 text-balance">
                    Ready to create some amazing game assets? Let's get started.
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                        <FolderPlus className="w-4 h-4" />
                        Total Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{projects.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Assets Generated
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {recentAssets.length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        This Month
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {
                          recentAssets.filter(
                            (asset) => new Date(asset.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                          ).length
                        }
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Success Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {recentAssets.length > 0
                          ? Math.round(
                              (recentAssets.filter((a) => a.status === "completed").length / recentAssets.length) * 100,
                            )
                          : 0}
                        %
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Projects */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Recent Projects</h3>
                    <Button variant="outline" onClick={() => setActiveTab("projects")} className="h-9">
                      <span className="text-sm">View all</span>
                    </Button>
                  </div>

                  {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projects.slice(0, 6).map((project) => (
                        <Card
                          key={project.id}
                          className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                        >
                          <CardHeader>
                            <CardTitle className="text-base group-hover:text-accent transition-colors">
                              {project.name}
                            </CardTitle>
                            {project.description && (
                              <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
                                {project.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Updated {new Date(project.updated_at).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <FolderPlus className="w-12 h-12 text-neutral-400 mb-4" />
                        <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                          No projects yet
                        </h4>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4 text-balance">
                          Create your first project to start generating amazing assets.
                        </p>
                        <Button
                          onClick={() => setActiveTab("generate")}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Project
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Recent Assets */}
                {recentAssets.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Recent Assets</h3>
                      <Button variant="outline" onClick={() => setActiveTab("assets")} className="h-9">
                        <span className="text-sm">View all</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {recentAssets.slice(0, 6).map((asset) => (
                        <Card
                          key={asset.id}
                          className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer aspect-square group"
                        >
                          <CardContent className="p-3">
                            <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-2 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                              {asset.image_url ? (
                                <img
                                  src={asset.image_url || "/placeholder.svg"}
                                  alt={asset.prompt}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-neutral-400" />
                              )}
                            </div>
                            <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                              {asset.asset_projects?.name || "Untitled"}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {new Date(asset.created_at).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-6">
                {/* Search */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Projects Grid */}
                {filteredProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                      <Card
                        key={project.id}
                        className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg group-hover:text-accent transition-colors">
                            {project.name}
                          </CardTitle>
                          {project.description && (
                            <CardDescription className="text-sm line-clamp-2">{project.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                            <span>0 assets</span>
                            <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <FolderPlus className="w-16 h-16 text-neutral-400 mb-6" />
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        No projects yet
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md">
                        Create your first project to start generating amazing game assets with AI.
                      </p>
                      <Button
                        onClick={() => setActiveTab("generate")}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Project
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <Search className="w-16 h-16 text-neutral-400 mb-6" />
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        No projects found
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        Try adjusting your search terms or create a new project.
                      </p>
                      <Button
                        onClick={() => setActiveTab("generate")}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Project
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Assets Tab */}
              <TabsContent value="assets" className="space-y-6">
                {/* Search */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      placeholder="Search assets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Assets Grid */}
                {filteredAssets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredAssets.map((asset) => (
                      <Card
                        key={asset.id}
                        className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
                      >
                        <CardContent className="p-0">
                          <div className="aspect-square bg-neutral-100 dark:bg-neutral-700 relative overflow-hidden">
                            {asset.image_url ? (
                              <img
                                src={asset.image_url || "/placeholder.svg"}
                                alt={asset.prompt}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-neutral-400" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 w-8 p-0 bg-white/90 dark:bg-neutral-800/90"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-4 space-y-2">
                            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 text-sm leading-tight">
                              {asset.prompt}
                            </h3>
                            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                              <span>{asset.asset_projects?.name || "No project"}</span>
                              <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <ImageIcon className="w-16 h-16 text-neutral-400 mb-4" />
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        No assets found
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        {searchQuery ? "Try adjusting your search" : "Start generating assets to see them here"}
                      </p>
                      <Button
                        onClick={() => setActiveTab("generate")}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Generate Your First Asset
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="generate" className="space-y-6">
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      Generate AI Asset
                    </CardTitle>
                    <CardDescription>
                      Create amazing game assets using AI. Describe what you want and let our AI bring it to life.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="prompt">Asset Description</Label>
                      <Textarea
                        id="prompt"
                        placeholder="Describe the asset you want to create (e.g., 'A medieval sword with glowing runes')"
                        value={generateForm.prompt}
                        onChange={(e) => setGenerateForm((prev) => ({ ...prev, prompt: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="project">Project</Label>
                        <Select
                          value={generateForm.projectId}
                          onValueChange={(value) => setGenerateForm((prev) => ({ ...prev, projectId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select existing project or create new" />
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="style">Style</Label>
                        <Select
                          value={generateForm.parameters.style}
                          onValueChange={(value) =>
                            setGenerateForm((prev) => ({
                              ...prev,
                              parameters: { ...prev.parameters, style: value },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realistic">Realistic</SelectItem>
                            <SelectItem value="cartoon">Cartoon</SelectItem>
                            <SelectItem value="pixel-art">Pixel Art</SelectItem>
                            <SelectItem value="fantasy">Fantasy</SelectItem>
                            <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quality">Quality</Label>
                        <Select
                          value={generateForm.parameters.quality}
                          onValueChange={(value) =>
                            setGenerateForm((prev) => ({
                              ...prev,
                              parameters: { ...prev.parameters, quality: value },
                            }))
                          }
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
                        <Label htmlFor="aspect">Aspect Ratio</Label>
                        <Select
                          value={generateForm.parameters.aspectRatio}
                          onValueChange={(value) =>
                            setGenerateForm((prev) => ({
                              ...prev,
                              parameters: { ...prev.parameters, aspectRatio: value },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1:1">Square (1:1)</SelectItem>
                            <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                            <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                            <SelectItem value="4:3">Classic (4:3)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="styleRef">Style Reference URL (Optional)</Label>
                      <Input
                        id="styleRef"
                        placeholder="https://example.com/reference-image.jpg"
                        value={generateForm.styleReference}
                        onChange={(e) => setGenerateForm((prev) => ({ ...prev, styleReference: e.target.value }))}
                      />
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={!generateForm.prompt.trim() || isGenerating}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
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
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
