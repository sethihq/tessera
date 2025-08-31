"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Heart, ImageIcon, MoreHorizontal, Trash2 } from "lucide-react"
import type { GeneratedAsset } from "@/lib/types"

interface AssetCardProps {
  asset: GeneratedAsset & { asset_projects?: { id: string; name: string } }
  onSelect: (asset: GeneratedAsset & { asset_projects?: { id: string; name: string } }) => void
}

export function AssetCard({ asset, onSelect }: AssetCardProps) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement download functionality
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement delete functionality
  }

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement favorite functionality
  }

  return (
    <Card
      className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden"
      onClick={() => onSelect(asset)}
    >
      <CardContent className="p-0">
        {/* Asset Image */}
        <div className="aspect-square bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
          {asset.image_url ? (
            <img
              src={asset.image_url || "/placeholder.svg"}
              alt={asset.prompt}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-slate-400" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge
              variant={
                asset.status === "completed" ? "default" : asset.status === "generating" ? "secondary" : "destructive"
              }
              className="text-xs"
            >
              {asset.status}
            </Badge>
          </div>

          {/* Actions Menu */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/90 dark:bg-slate-800/90">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleFavorite}>
                  <Heart className="w-4 h-4 mr-2" />
                  Favorite
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Asset Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2 text-sm leading-tight">
            {asset.prompt}
          </h3>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{asset.asset_projects?.name || "No project"}</span>
            <span>{new Date(asset.created_at).toLocaleDateString()}</span>
          </div>

          {/* Parameters */}
          {asset.parameters && (
            <div className="flex flex-wrap gap-1">
              {asset.parameters.style && (
                <Badge variant="outline" className="text-xs">
                  {asset.parameters.style}
                </Badge>
              )}
              {asset.parameters.size && (
                <Badge variant="outline" className="text-xs">
                  {asset.parameters.size}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
