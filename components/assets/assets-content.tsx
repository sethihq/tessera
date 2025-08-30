"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ImageIcon, Search, FileArchive } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useCallback } from "react"
import type { AssetProject, GeneratedAsset } from "@/lib/types"
import { AssetCard } from "@/components/assets/asset-card"
import { AssetDetailModal } from "@/components/assets/asset-detail-modal"
import { ExportModal } from "@/components/assets/export-modal"

interface AssetsContentProps {
  assets: (GeneratedAsset & { asset_projects?: { id: string; name: string } })[]
  projects: AssetProject[]
}

export function AssetsContent({ assets, projects }: AssetsContentProps) {
  const [selectedAsset, setSelectedAsset] = useState<
    (GeneratedAsset & { asset_projects?: { id: string; name: string } }) | null
  >(null)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [sortBy, setSortBy] = useState("created_at")
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      router.push(`/dashboard/assets?${params.toString()}`)
    },
    [router, searchParams],
  )

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value)
      updateFilters({ search: value })
    },
    [updateFilters],
  )

  const handleProjectFilter = useCallback(
    (value: string) => {
      setSelectedProject(value)
      updateFilters({ project: value })
    },
    [updateFilters],
  )

  const handleSort = useCallback(
    (value: string) => {
      setSortBy(value)
      updateFilters({ sort: value })
    },
    [updateFilters],
  )

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets((prev) => (prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]))
  }

  const toggleAllAssets = () => {
    setSelectedAssets((prev) => (prev.length === assets.length ? [] : assets.map((asset) => asset.id)))
  }

  const handleBulkExport = () => {
    const assetsToExport = assets.filter((asset) => selectedAssets.includes(asset.id))
    if (assetsToExport.length > 0) {
      setShowExportModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Asset Gallery</h1>
            <p className="text-slate-600 dark:text-slate-400">Browse and manage your generated assets</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsSelectionMode(!isSelectionMode)}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            >
              {isSelectionMode ? "Cancel Selection" : "Select Assets"}
            </Button>
            {isSelectionMode && selectedAssets.length > 0 && (
              <Button onClick={handleBulkExport} className="bg-gradient-to-r from-blue-500 to-purple-600">
                <FileArchive className="w-4 h-4 mr-2" />
                Export ({selectedAssets.length})
              </Button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {isSelectionMode && (
                  <Button variant="outline" size="sm" onClick={toggleAllAssets} className="bg-transparent">
                    {selectedAssets.length === assets.length ? "Deselect All" : "Select All"}
                  </Button>
                )}

                <Select value={selectedProject} onValueChange={handleProjectFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={handleSort}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Newest first</SelectItem>
                    <SelectItem value="prompt">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assets Grid */}
        {assets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="relative">
                {isSelectionMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedAssets.includes(asset.id)}
                      onCheckedChange={() => toggleAssetSelection(asset.id)}
                      className="bg-white/90 dark:bg-slate-800/90"
                    />
                  </div>
                )}
                <AssetCard
                  asset={asset}
                  onSelect={isSelectionMode ? () => toggleAssetSelection(asset.id) : setSelectedAsset}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ImageIcon className="w-16 h-16 text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No assets found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm || selectedProject !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start generating assets to see them here"}
              </p>
              <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Link href="/dashboard/generate">Generate Your First Asset</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Asset Detail Modal */}
        {selectedAsset && <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}

        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            assets={assets.filter((asset) => selectedAssets.includes(asset.id))}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </div>
  )
}
