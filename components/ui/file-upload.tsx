"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Upload, X } from "lucide-react"
import { useCallback, useState } from "react"

interface FileUploadProps {
  accept?: string
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  className?: string
  maxSize?: number // in MB
}

export function FileUpload({ accept = "*", onFileSelect, selectedFile, className, maxSize = 10 }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        const file = files[0]
        if (file.size > maxSize * 1024 * 1024) {
          alert(`File size must be less than ${maxSize}MB`)
          return
        }
        onFileSelect(file)
      }
    },
    [onFileSelect, maxSize],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0]
        if (file.size > maxSize * 1024 * 1024) {
          alert(`File size must be less than ${maxSize}MB`)
          return
        }
        onFileSelect(file)
      }
    },
    [onFileSelect, maxSize],
  )

  const removeFile = useCallback(() => {
    onFileSelect(null)
  }, [onFileSelect])

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg transition-colors",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      {selectedFile ? (
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{selectedFile.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={removeFile}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
            Drop your file here, or click to browse
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Supports images up to {maxSize}MB</p>
        </div>
      )}
    </div>
  )
}
