"use client"

// Luxe UI + Origin UI Components
import { Button } from "@/components/luxe-ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/origin-ui/card"
import { Input } from "@/components/origin-ui/input"
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
} from "@/components/luxe-ui/sidebar"
import { Tabs, TabsContent } from "@/components/origin-ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { SpriteSheetCreator } from "@/components/sprite-sheet/sprite-sheet-creator"
import {
  HomeIcon,
  ProjectsIcon,
  AssetsIcon,
  GenerateIcon,
  SettingsIcon,
  LogoutIcon,
  PlusIcon,
  SearchIcon,
  DownloadIcon,
  FolderPlusIcon,
  CalendarIcon,
  TrendingUpIcon,
  GridIcon,
  RefreshCwIcon,
} from "@/components/rounded-icons/icons"
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

  const [assets, setAssets] = useState(recentAssets)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateForm, setGenerateForm] = useState({
    prompt: "",
    projectId: "",
    newProjectName: "",
    assetType: "props",
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
      icon: HomeIcon,
      value: "overview",
    },
    {
      title: "Projects",
      icon: ProjectsIcon,
      value: "projects",
    },
    {
      title: "Assets",
      icon: AssetsIcon,
      value: "assets",
    },
    {
      title: "Generate",
      icon: GenerateIcon,
      value: "generate",
    },
    {
      title: "Sprite Sheets",
      icon: GridIcon,
      value: "sprite-sheets",
    },
  ]

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredAssets = assets.filter(
    (asset) =>
      asset.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.asset_projects?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleGenerate = async () => {
    if (!generateForm.prompt.trim()) {
      alert("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    console.log("[v0] Starting generation with form:", generateForm)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: generateForm.prompt,
          projectId: generateForm.projectId === "new" ? null : generateForm.projectId,
          newProjectName: generateForm.projectId === "new" ? generateForm.newProjectName : undefined,
          assetType: generateForm.assetType,
          parameters: generateForm.parameters,
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Generation result:", result)

      if (result.success) {
        if (result.asset) {
          setAssets((prevAssets) => [result.asset, ...prevAssets])
        }

        await refreshAssets()
        setGenerateForm({ ...generateForm, prompt: "" })
        console.log("[v0] Generation completed successfully!")
      } else {
        throw new Error(result.error || "Generation failed")
      }
    } catch (error) {
      console.error("[v0] Generation error:", error)
      alert(`Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const refreshAssets = async () => {
    setIsRefreshing(true)
    try {
      const { data: freshAssets } = await supabase
        .from("generated_assets")
        .select(`
          *,
          asset_projects (
            id,
            name
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (freshAssets) {
        setAssets(freshAssets)
      }
    } catch (error) {
      console.error("[v0] Error refreshing assets:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-900">
          <Sidebar className="border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <SidebarHeader className="border-b border-neutral-200 dark:border-neutral-800 p-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FF6600] rounded-xl flex items-center justify-center shadow-sm">
                  <GenerateIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Tessera</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">AI Game Assets</p>
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
                          className="h-10 px-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 data-[active=true]:bg-[#FF6600] data-[active=true]:text-white transition-all duration-200"
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
                          <SettingsIcon className="w-4 h-4" />
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
                <LogoutIcon className="w-4 h-4 mr-2" />
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
                className="bg-[#FF6600] hover:bg-[#E55A00] text-white shadow-sm h-9 px-4"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Generate Asset</span>
              </Button>
            </header>

            <main className="flex-1 p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-8">
                  {/* Welcome Section */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Welcome to Tessera!</h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-balance">
                      Create visually consistent 2D environment art assets for your indie games with AI.
                    </p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                          <FolderPlusIcon className="w-4 h-4" />
                          Total Projects
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {projects.length}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                          <AssetsIcon className="w-4 h-4" />
                          Assets Generated
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{assets.length}</div>
                      </CardContent>
                    </Card>

                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          This Month
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {
                            assets.filter(
                              (asset) => new Date(asset.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                            ).length
                          }
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                          <TrendingUpIcon className="w-4 h-4" />
                          Success Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {assets.length > 0
                            ? Math.round((assets.filter((a) => a.status === "completed").length / assets.length) * 100)
                            : 0}
                          %
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Assets */}
                  {assets.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Recent Assets</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshAssets}
                            disabled={isRefreshing}
                            className="h-9 bg-transparent"
                          >
                            <RefreshCwIcon className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                            <span className="text-sm">Refresh</span>
                          </Button>
                          <Button variant="outline" onClick={() => setActiveTab("assets")} className="h-9">
                            <span className="text-sm">View all</span>
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {assets.slice(0, 6).map((asset) => (
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
                                  <AssetsIcon className="w-8 h-8 text-neutral-400" />
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
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        placeholder="SearchIcon projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchIconQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProjects.map((project) => (
                        <Card
                          key={project.id}
                          className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                        >
                          <CardHeader>
                            <CardTitle className="text-lg group-hover:text-[#FF6600] transition-colors">
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
                  ) : (
                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <FolderPlusIcon className="w-16 h-16 text-neutral-400 mb-6" />
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                          No projects yet
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md">
                          Create your first project to start generating visually consistent game assets.
                        </p>
                        <Button
                          onClick={() => setActiveTab("generate")}
                          className="bg-[#FF6600] hover:bg-[#E55A00] text-white"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Create Your First Project
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Assets Tab */}
                <TabsContent value="assets" className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        placeholder="SearchIcon assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchIconQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

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
                                  <AssetsIcon className="w-12 h-12 text-neutral-400" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-white/90 dark:bg-neutral-800/90"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Handle download
                                  }}
                                >
                                  <DownloadIcon className="w-4 h-4" />
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
                        <AssetsIcon className="w-16 h-16 text-neutral-400 mb-4" />
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                          No assets found
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                          {searchQuery ? "Try adjusting your search" : "Start generating assets to see them here"}
                        </p>
                        <Button
                          onClick={() => setActiveTab("generate")}
                          className="bg-[#FF6600] hover:bg-[#E55A00] text-white"
                        >
                          Generate Your First Asset
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Generate Tab */}
                <TabsContent value="generate" className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Generate Assets</h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Create game-ready 2D environment art with consistent visual style
                    </p>
                  </div>

                  <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">Asset Generator</CardTitle>
                      <CardDescription>Describe the asset you want to create for your game</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Asset Type Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Asset Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { value: "parallax", label: "Parallax Background", desc: "Multi-layer backgrounds" },
                            { value: "tileset", label: "Tileset", desc: "Seamless tile patterns" },
                            { value: "props", label: "Props & Objects", desc: "Individual game objects" },
                            { value: "fx", label: "FX Sprites", desc: "Visual effects & animations" },
                          ].map((type) => (
                            <Card
                              key={type.value}
                              className={`cursor-pointer transition-all duration-200 ${
                                generateForm.assetType === type.value
                                  ? "border-[#FF6600] bg-[#FF6600]/5"
                                  : "border-neutral-200 dark:border-neutral-800 hover:border-[#FF6600]/50"
                              }`}
                              onClick={() => setGenerateForm({ ...generateForm, assetType: type.value })}
                            >
                              <CardContent className="p-4 text-center">
                                <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                                  {type.label}
                                </h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{type.desc}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Prompt Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          Asset Description
                        </label>
                        <textarea
                          value={generateForm.prompt}
                          onChange={(e) => setGenerateForm({ ...generateForm, prompt: e.target.value })}
                          placeholder="Describe the asset you want to create... (e.g., 'Medieval stone castle wall tileset with moss and weathering')"
                          className="w-full h-24 px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                        />
                      </div>

                      {/* Project Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Project</label>
                        <select
                          value={generateForm.projectId}
                          onChange={(e) => setGenerateForm({ ...generateForm, projectId: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        >
                          <option value="">Select a project</option>
                          <option value="new">Create new project</option>
                          {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* New Project Name */}
                      {generateForm.projectId === "new" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            New Project Name
                          </label>
                          <Input
                            value={generateForm.newProjectName}
                            onChange={(e) => setGenerateForm({ ...generateForm, newProjectName: e.target.value })}
                            placeholder="Enter project name..."
                            className="border-neutral-200 dark:border-neutral-800"
                          />
                        </div>
                      )}

                      {/* Generate Button */}
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !generateForm.prompt.trim()}
                        className="w-full bg-[#FF6600] hover:bg-[#E55A00] text-white h-12"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                            Generating Asset...
                          </>
                        ) : (
                          <>
                            <GenerateIcon className="w-4 h-4 mr-2" />
                            Generate Asset
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sprite Sheets Tab */}
                <TabsContent value="sprite-sheets" className="space-y-6">
                  <SpriteSheetCreator 
                    projects={projects}
                    worldStyles={[]} // TODO: Fetch world styles
                    templates={[]} // TODO: Fetch templates
                    onSpriteSheetCreated={(spriteSheet) => {
                      console.log("Sprite sheet created:", spriteSheet)
                      // TODO: Handle sprite sheet creation
                    }}
                  />
                </TabsContent>
              </Tabs>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
