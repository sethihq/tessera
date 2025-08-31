"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

  const handleGenerateClick = () => {
    router.push("/dashboard/generate")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
        <Sidebar className="border-r border-neutral-200/60 dark:border-neutral-800/60 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl">
          <SidebarHeader className="border-b border-neutral-200/60 dark:border-neutral-800/60 p-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-neutral-800 to-neutral-600 dark:from-neutral-200 dark:to-neutral-400 rounded-xl flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-white dark:text-neutral-900" />
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
                        onClick={() => {
                          if (item.value === "generate") {
                            handleGenerateClick()
                          } else {
                            setActiveTab(item.value)
                          }
                        }}
                        isActive={activeTab === item.value}
                        className="h-10 px-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 data-[active=true]:bg-neutral-900 data-[active=true]:text-white dark:data-[active=true]:bg-neutral-100 dark:data-[active=true]:text-neutral-900 transition-all duration-200"
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
                      className="h-10 px-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all duration-200"
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

          <SidebarFooter className="border-t border-neutral-200/60 dark:border-neutral-800/60 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-neutral-400 to-neutral-600 dark:from-neutral-500 dark:to-neutral-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-white dark:text-neutral-900">
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
              className="w-full justify-start bg-transparent border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 h-9"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="text-sm">Sign out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl px-6">
            <SidebarTrigger className="hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {menuItems.find((item) => item.value === activeTab)?.title || "Dashboard"}
              </h1>
            </div>
            <Button
              onClick={handleGenerateClick}
              className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white shadow-sm h-9 px-4"
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
                  <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm hover:shadow-md transition-shadow duration-200">
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

                  <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm hover:shadow-md transition-shadow duration-200">
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

                  <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm hover:shadow-md transition-shadow duration-200">
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

                  <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("projects")}
                      className="bg-transparent border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 h-9"
                    >
                      <span className="text-sm">View all</span>
                    </Button>
                  </div>

                  {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projects.slice(0, 6).map((project) => (
                        <Card
                          key={project.id}
                          className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                        >
                          <CardHeader>
                            <CardTitle className="text-base group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
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
                    <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <FolderPlus className="w-12 h-12 text-neutral-400 mb-4" />
                        <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                          No projects yet
                        </h4>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4 text-balance">
                          Create your first project to start generating amazing assets.
                        </p>
                        <Button
                          onClick={handleGenerateClick}
                          className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white shadow-sm"
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
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("assets")}
                        className="bg-transparent border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 h-9"
                      >
                        <span className="text-sm">View all</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {recentAssets.slice(0, 6).map((asset) => (
                        <Card
                          key={asset.id}
                          className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer aspect-square group"
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
                      className="pl-10 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-0 shadow-sm"
                    />
                  </div>
                </div>

                {/* Projects Grid */}
                {filteredProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                      <Card
                        key={project.id}
                        className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
                  <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <FolderPlus className="w-16 h-16 text-neutral-400 mb-6" />
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        No projects yet
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md">
                        Create your first project to start generating amazing game assets with AI.
                      </p>
                      <Button onClick={handleGenerateClick} className="bg-gradient-to-r from-blue-500 to-purple-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Project
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <Search className="w-16 h-16 text-neutral-400 mb-6" />
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        No projects found
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        Try adjusting your search terms or create a new project.
                      </p>
                      <Button onClick={handleGenerateClick} className="bg-gradient-to-r from-blue-500 to-purple-600">
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
                      className="pl-10 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-0 shadow-sm"
                    />
                  </div>
                </div>

                {/* Assets Grid */}
                {filteredAssets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredAssets.map((asset) => (
                      <Card
                        key={asset.id}
                        className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
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
                  <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <ImageIcon className="w-16 h-16 text-neutral-400 mb-4" />
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        No assets found
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        {searchQuery ? "Try adjusting your search" : "Start generating assets to see them here"}
                      </p>
                      <Button onClick={handleGenerateClick} className="bg-gradient-to-r from-blue-500 to-purple-600">
                        Generate Your First Asset
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Generate Tab */}
              <TabsContent value="generate" className="space-y-6">
                <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Sparkles className="w-16 h-16 text-neutral-400 mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                      Asset Generation
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      Ready to create amazing assets? Use our dedicated generation page.
                    </p>
                    <Button
                      onClick={handleGenerateClick}
                      className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Go to Generator
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
