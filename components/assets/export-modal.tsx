"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Download, FileArchive, Loader2, X } from "lucide-react"
import { useState } from "react"
import type { GeneratedAsset } from "@/lib/types"

interface ExportModalProps {
  assets: (GeneratedAsset & { asset_projects?: { id: string; name: string } })[]
  onClose: () => void
}

export function ExportModal({ assets, onClose }: ExportModalProps) {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(assets.map((asset) => asset.id))
  const [format, setFormat] = useState<"zip" | "single">("zip")
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [quality, setQuality] = useState<"original" | "compressed">("original")
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const handleExport = async () => {
    if (selectedAssets.length === 0) return

    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetIds: selectedAssets,
          format: selectedAssets.length === 1 ? "single" : "zip",
          includeMetadata,
          quality,
        }),
      })

      clearInterval(progressInterval)
      setExportProgress(100)

      if (!response.ok) {
        throw new Error("Export failed")
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "export.zip"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      onClose()
    } catch (error) {
      console.error("Export error:", error)
      // Handle error (show toast, etc.)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const toggleAsset = (assetId: string) => {
    setSelectedAssets((prev) => (prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]))
  }

  const toggleAll = () => {
    setSelectedAssets((prev) => (prev.length === assets.length ? [] : assets.map((asset) => asset.id)))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileArchive className="w-5 h-5" />
              Export Assets
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Asset Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Select Assets ({selectedAssets.length} selected)</Label>
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {selectedAssets.length === assets.length ? "Deselect All" : "Select All"}
              </Button>
            </div>

            <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <Checkbox checked={selectedAssets.includes(asset.id)} onCheckedChange={() => toggleAsset(asset.id)} />
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                    <img
                      src={asset.image_url || "/placeholder.svg"}
                      alt={asset.prompt}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{asset.prompt}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {asset.asset_projects?.name || "No project"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Export Settings</Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={(value: "zip" | "single") => setFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zip">ZIP Archive</SelectItem>
                    <SelectItem value="single" disabled={selectedAssets.length > 1}>
                      Single File
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quality</Label>
                <Select value={quality} onValueChange={(value: "original" | "compressed") => setQuality(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original</SelectItem>
                    <SelectItem value="compressed">Compressed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="include-metadata">Include Metadata</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Include JSON files with generation parameters and details
                </p>
              </div>
              <Switch id="include-metadata" checked={includeMetadata} onCheckedChange={setIncludeMetadata} />
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Exporting assets...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}

          {/* Export Summary */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">Export Summary</h4>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <p>• {selectedAssets.length} assets selected</p>
              <p>• Format: {format === "zip" ? "ZIP Archive" : "Single File"}</p>
              <p>• Quality: {quality}</p>
              <p>• Metadata: {includeMetadata ? "Included" : "Not included"}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={selectedAssets.length === 0 || isExporting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Assets
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
