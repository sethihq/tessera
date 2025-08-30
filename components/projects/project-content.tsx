"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ImageIcon, Plus, Settings } from "lucide-react"
import Link from "next/link"
import type { AssetProject, GeneratedAsset } from "@/lib/types"
import { AssetCard } from "@/components/assets/asset-card"
import { AssetDetailModal } from "@/components/assets/asset-detail-modal"
import { useState } from "react"

interface ProjectContentProps {
  project: AssetProject
  assets: GeneratedAsset[]
}

export function ProjectContent({ project, assets }: ProjectContentProps) {
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null)

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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{project.name}</h1>
            {project.description && <p className="text-slate-600 dark:text-slate-400 mt-1">{project.description}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Link href={`/dashboard/generate?project=${project.id}`}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Asset
              </Link>
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{assets.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {assets.filter((asset) => asset.status === "completed").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-900 dark:text-slate-100">
                {new Date(project.updated_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assets Grid */}
        {assets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={{ ...asset, asset_projects: project }} onSelect={setSelectedAsset} />
            ))}
          </div>
        ) : (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ImageIcon className="w-16 h-16 text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No assets yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start generating assets for this project to see them here.
              </p>
              <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Link href={`/dashboard/generate?project=${project.id}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate First Asset
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Asset Detail Modal */}
        {selectedAsset && (
          <AssetDetailModal
            asset={{ ...selectedAsset, asset_projects: project }}
            onClose={() => setSelectedAsset(null)}
          />
        )}
      </div>
    </div>
  )
}
