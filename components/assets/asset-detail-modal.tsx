"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Heart, ImageIcon, Share, Trash2, X, FileArchive } from "lucide-react"
import { useState } from "react"
import type { GeneratedAsset } from "@/lib/types"
import { ExportModal } from "@/components/assets/export-modal"

interface AssetDetailModalProps {
  asset: GeneratedAsset & { asset_projects?: { id: string; name: string } }
  onClose: () => void
}

export function AssetDetailModal({ asset, onClose }: AssetDetailModalProps) {
  const [showExportModal, setShowExportModal] = useState(false)

  const handleDownload = async () => {
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetIds: [asset.id],
          format: "single",
          includeMetadata: false,
          quality: "original",
        }),
      })

      if (!response.ok) throw new Error("Download failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${asset.prompt.slice(0, 30)}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
    }
  }

  const handleShare = async () => {
    // TODO: Implement share functionality
    console.log("Share asset:", asset.id)
  }

  const handleDelete = async () => {
    // TODO: Implement delete functionality
    console.log("Delete asset:", asset.id)
    onClose()
  }

  const handleFavorite = async () => {
    // TODO: Implement favorite functionality
    console.log("Favorite asset:", asset.id)
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Asset Details</span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                {asset.image_url ? (
                  <img
                    src={asset.image_url || "/placeholder.svg"}
                    alt={asset.prompt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => setShowExportModal(true)}>
                  <FileArchive className="w-4 h-4 mr-2" />
                  Export Options
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" onClick={handleFavorite}>
                  <Heart className="w-4 h-4 mr-2" />
                  Favorite
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Asset Information */}
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    asset.status === "completed"
                      ? "default"
                      : asset.status === "generating"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {asset.status}
                </Badge>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Created {new Date(asset.created_at).toLocaleString()}
                </span>
              </div>

              {/* Prompt */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Prompt</h3>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                  {asset.prompt}
                </p>
              </div>

              {/* Project */}
              {asset.asset_projects && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Project</h3>
                  <p className="text-slate-700 dark:text-slate-300">{asset.asset_projects.name}</p>
                </div>
              )}

              <Separator />

              {/* Generation Parameters */}
              {asset.parameters && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Generation Parameters</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {asset.parameters.style && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Style:</span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                          {asset.parameters.style}
                        </span>
                      </div>
                    )}
                    {asset.parameters.quality && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Quality:</span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                          {asset.parameters.quality}
                        </span>
                      </div>
                    )}
                    {asset.parameters.size && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Size:</span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                          {asset.parameters.size}
                        </span>
                      </div>
                    )}
                    {asset.parameters.batch_size && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Batch Size:</span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                          {asset.parameters.batch_size}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Technical Details</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Asset ID:</span>
                    <span className="font-mono text-slate-900 dark:text-slate-100">{asset.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Created:</span>
                    <span className="text-slate-900 dark:text-slate-100">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      {showExportModal && <ExportModal assets={[asset]} onClose={() => setShowExportModal(false)} />}
    </>
  )
}
