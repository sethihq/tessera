"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { HomeIcon, ProjectsIcon, AssetsIcon, GenerateIcon, SettingsIcon, LogoutIcon } from "@/components/ui/icons"
import { signOut } from "@/lib/auth-client"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import type { Profile, AssetProject, GeneratedAsset } from "@/lib/db/schema"

interface DashboardContentProps {
  user: { id: string; email?: string; name?: string }
  profile: Profile | null
  projects: AssetProject[]
  recentAssets: (GeneratedAsset & { asset_projects?: { name: string } })[]
}

export function DashboardContent({ user, profile, projects, recentAssets }: DashboardContentProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/sign-in")
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: HomeIcon,
      href: "/dashboard",
      isActive: true,
    },
    {
      title: "Projects",
      icon: ProjectsIcon,
      href: "/dashboard/projects",
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
      <div className="flex min-h-screen w-full bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
        <Sidebar className="border-r border-neutral-200/60 dark:border-neutral-800/60 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl">
          <SidebarHeader className="border-b border-neutral-200/60 dark:border-neutral-800/60 p-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-neutral-800 to-neutral-600 dark:from-neutral-200 dark:to-neutral-400 rounded-xl flex items-center justify-center shadow-sm">
                <GenerateIcon className="w-5 h-5 text-white dark:text-neutral-900" />
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
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.isActive}
                        className="h-10 px-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 data-[active=true]:bg-neutral-900 data-[active=true]:text-white dark:data-[active=true]:bg-neutral-100 dark:data-[active=true]:text-neutral-900 transition-all duration-200"
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.title}</span>
                        </Link>
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
                      <Link href="/dashboard/profile" className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                        <span className="text-sm font-medium">Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="h-10 px-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all duration-200"
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

          <SidebarFooter className="border-t border-neutral-200/60 dark:border-neutral-800/60 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-neutral-400 to-neutral-600 dark:from-neutral-500 dark:to-neutral-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-white dark:text-neutral-900">
                  {profile?.fullName?.[0]?.toUpperCase() ||
                    user.name?.[0]?.toUpperCase() ||
                    user.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {profile?.fullName || user.name || user.email?.split("@")[0]}
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
              <LogoutIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">Sign out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl px-6">
            <SidebarTrigger className="hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
            </div>
            <Button
              asChild
              className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white shadow-sm h-9 px-4"
            >
              <Link href="/dashboard/generate">
                <Plus className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">New Project</span>
              </Link>
            </Button>
          </header>

          <main className="flex-1 p-6 space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Welcome back, {profile?.fullName || user.name || user.email?.split("@")[0]}!
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-balance">
                Ready to create some amazing game assets? Let's get started.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Total Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{projects.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Assets Generated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{recentAssets.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {
                      recentAssets.filter(
                        (asset) => new Date(asset.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      ).length
                    }
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
                  asChild
                  className="bg-transparent border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 h-9"
                >
                  <Link href="/dashboard/projects">
                    <span className="text-sm">View all</span>
                  </Link>
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
                          Updated {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <ProjectsIcon className="w-12 h-12 text-neutral-400 mb-4" />
                    <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No projects yet</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4 text-balance">
                      Create your first project to start generating amazing assets.
                    </p>
                    <Button
                      asChild
                      className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white shadow-sm"
                    >
                      <Link href="/dashboard/generate">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Project
                      </Link>
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
                    asChild
                    className="bg-transparent border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 h-9"
                  >
                    <Link href="/dashboard/assets">
                      <span className="text-sm">View all</span>
                    </Link>
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
                          <AssetsIcon className="w-8 h-8 text-neutral-400" />
                        </div>
                        <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {asset.asset_projects?.name || "Untitled"}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
