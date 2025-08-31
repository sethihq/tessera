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
import { createClient } from "@/lib/supabase/client"
import { ProjectsIcon, HomeIconIcon, AssetsIcon, LogoutIcon, PlusIconIcon, SearchIconIcon, SettingsIconIcon, GenerateIcon, UserIcon } from "@/components/rounded-icons/icons"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { AssetProject } from "@/lib/types"

interface ProjectsContentProps {
  projects: (AssetProject & { generated_assets?: { count: number }[] })[]
}

export function ProjectsContent({ projects }: ProjectsContentProps) {
  const router = useRouter()
  const supabase = createClient()
  const [searchQuery, setSearchIconQuery] = useState("")

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const menuItems = [
    {
      title: "Dashboard",
      icon: HomeIcon,
      href: "/dashboard",
    },
    {
      title: "Projects",
      icon: ProjectsIcon,
      href: "/dashboard/projects",
      isActive: true,
    },
    {
      title: "Assets",
      icon: AssetsIcon,
      href: "/dashboard/assets",
    },
    {
      title: "Generate",
      icon: GenerateIcon,
      href: "/dashboard/generate",
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Sidebar className="border-r-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <GenerateIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">AI Asset Creator</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Create with AI</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={item.isActive}>
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/profile" className="flex items-center gap-3">
                        <UserIcon className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/settings" className="flex items-center gap-3">
                        <SettingsIcon className="w-4 h-4" />
                        <span>SettingsIcon</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 dark:border-slate-700 p-4">
            <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full justify-start bg-transparent">
              <LogoutIcon className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Projects</h1>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Link href="/dashboard/generate">
                <PlusIcon className="w-4 h-4 mr-2" />
                New Project
              </Link>
            </Button>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* SearchIcon and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="SearchIcon projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchIconQuery(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm"
                />
              </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
                  >
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <CardHeader>
                        <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {project.name}
                        </CardTitle>
                        {project.description && (
                          <CardDescription className="text-sm line-clamp-2">{project.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                          <span>{project.generated_assets?.[0]?.count || 0} assets</span>
                          <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <ProjectsIcon className="w-16 h-16 text-slate-400 mb-6" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No projects yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
                    Create your first project to start generating amazing game assets with AI.
                  </p>
                  <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <Link href="/dashboard/generate">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create Your First Project
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <SearchIcon className="w-16 h-16 text-slate-400 mb-6" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No projects found</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Try adjusting your search terms or create a new project.
                  </p>
                  <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <Link href="/dashboard/generate">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create New Project
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
