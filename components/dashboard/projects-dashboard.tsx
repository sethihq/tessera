"use client"

import type React from "react"

import { useState } from "react"
import { Search, MoreHorizontal, Users, ChevronDown, Plus, Folder, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  files?: ProjectFile[]
}

interface ProjectFile {
  id: string
  name: string
  type: "canvas" | "sprite_sheet" | "asset_pack"
  project_id: string
  updated_at: string
  project?: { name: string }
}

interface ProjectsDashboardProps {
  projects: Project[]
  recentFiles: ProjectFile[]
  user: any
}

export function ProjectsDashboard({ projects, recentFiles, user }: ProjectsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")

  const filteredProjects = projects.filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    setIsCreatingProject(true)
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim() }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to create project:", error)
    } finally {
      setIsCreatingProject(false)
      setNewProjectName("")
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <div className="w-64 bg-zinc-900/50 backdrop-blur-xl border-r border-zinc-800/50 flex flex-col">
        {/* User Profile Section */}
        <div className="p-4 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 ring-2 ring-zinc-700">
              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-[#FF6600] text-white font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium truncate">
                  {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}'s Workspace
                </span>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </div>
              <span className="text-xs text-zinc-500">1 Member</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-6">
          <div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              All
            </div>
          </div>

          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-medium text-zinc-400 uppercase tracking-wide">Shared with me</div>
            <div className="px-3 py-2 text-xs font-medium text-zinc-400 uppercase tracking-wide">Community</div>
          </div>

          <div className="space-y-2">
            <div className="px-3 py-2 text-xs font-medium text-zinc-400 uppercase tracking-wide">Favorites</div>
            <div className="px-3 py-2 text-sm text-zinc-500">No favorites yet</div>
          </div>

          <div className="space-y-2">
            <div className="px-3 py-2 text-xs font-medium text-zinc-400 uppercase tracking-wide">Workspace</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                <Folder className="h-4 w-4" />
                All
              </div>
              {projects.slice(0, 3).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded-lg cursor-pointer transition-all duration-200"
                >
                  <Folder className="h-4 w-4" />
                  {project.name}
                </div>
              ))}
              {projects.length > 3 && (
                <div className="px-3 py-2 text-sm text-zinc-500">... {projects.length - 3} more</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">All</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-[#FF6600]/50"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-zinc-400">
                <Users className="h-4 w-4" />1
              </div>
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800/50">
                Invite
              </Button>
              <Button
                size="sm"
                className="bg-[#FF6600] hover:bg-[#E55A00] text-white shadow-lg shadow-[#FF6600]/20"
                onClick={() => setIsCreatingProject(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New project
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-zinc-950">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </main>
      </div>

      {isCreatingProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900/90 backdrop-blur-xl rounded-xl p-6 w-96 border border-zinc-700/50 shadow-2xl">
            <h3 className="text-lg font-medium mb-4">Create New Project</h3>
            <Input
              placeholder="Project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
              className="mb-4 bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-[#FF6600]/50"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsCreatingProject(false)
                  setNewProjectName("")
                }}
                className="hover:bg-zinc-800/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="bg-[#FF6600] hover:bg-[#E55A00] shadow-lg shadow-[#FF6600]/20"
              >
                {isCreatingProject ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* Enhanced ProjectCard with proper navigation and better visual design */
function ProjectCard({ project }: { project: Project }) {
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleProjectClick = async () => {
    setIsCreatingFile(true)
    try {
      // Create a default file for the project if it doesn't exist
      const response = await fetch("/api/projects/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project.id,
          name: "Untitled Canvas",
          type: "canvas",
        }),
      })

      if (response.ok) {
        const { file } = await response.json()
        window.location.href = `/canvas/${file.id}`
      }
    } catch (error) {
      console.error("Failed to create file:", error)
    } finally {
      setIsCreatingFile(false)
    }
  }

  const handleDeleteProject = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects?id=${project.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        window.location.reload()
      } else {
        console.error("Failed to delete project")
      }
    } catch (error) {
      console.error("Failed to delete project:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card
      className="group hover:ring-2 hover:ring-[#FF6600]/50 transition-all duration-300 cursor-pointer bg-zinc-800/30 backdrop-blur-sm border-zinc-700/50 overflow-hidden hover:shadow-xl hover:shadow-[#FF6600]/10 relative"
      onClick={handleProjectClick}
    >
      <div className="aspect-video bg-gradient-to-br from-zinc-700/50 to-zinc-800/50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="text-4xl opacity-40 group-hover:opacity-60 transition-opacity duration-300">🎮</div>
        {(isCreatingFile || isDeleting) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#FF6600] border-t-transparent" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate group-hover:text-[#FF6600] transition-colors duration-200">
              {project.name}
            </h3>
            <p className="text-sm text-zinc-400 mt-1 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Edited {new Date(project.updated_at).toLocaleDateString()}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-zinc-700/50"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-800/90 backdrop-blur-xl border-zinc-700/50 shadow-xl">
              <DropdownMenuItem
                className="text-white hover:bg-zinc-700/50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  handleProjectClick()
                }}
              >
                Open
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-zinc-700/50 cursor-pointer">Rename</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-zinc-700/50 cursor-pointer">Duplicate</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                onClick={handleDeleteProject}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
