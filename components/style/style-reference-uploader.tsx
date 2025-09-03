"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/luxe-ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { 
  Upload, 
  Image as ImageIcon, 
  Palette, 
  X, 
  Eye,
  Download,
  Trash2,
  Sparkles,
  Check
} from "lucide-react"

interface ColorPalette {
  dominant: string[]
  accent: string[]
  neutral: string[]
}

interface StyleReference {
  id: string
  name: string
  description: string
  imageUrl: string
  extractedPalette: ColorPalette
  styleMetadata: {
    mood?: string
    lighting?: string
    texture_style?: string
    art_style?: string
  }
  createdAt: string
}

interface StyleReferenceUploaderProps {
  onStyleReferenceCreated?: (styleRef: StyleReference) => void
  existingReferences?: StyleReference[]
}

export function StyleReferenceUploader({ 
  onStyleReferenceCreated, 
  existingReferences = [] 
}: StyleReferenceUploaderProps) {
  const supabase = createClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mood: '',
    lighting: '',
    textureStyle: '',
    artStyle: ''
  })
  const [extractedPalette, setExtractedPalette] = useState<ColorPalette | null>(null)
  const [styleReferences, setStyleReferences] = useState<StyleReference[]>(existingReferences)

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      
      // Auto-generate name from filename
      if (!formData.name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
        setFormData(prev => ({ ...prev, name: nameWithoutExt }))
      }
    }
  }, [formData.name])

  const extractColorPalette = async (imageUrl: string): Promise<ColorPalette> => {
    // This would ideally use a color extraction API or library
    // For now, returning a mock palette - in production you'd use:
    // - Vibrant.js for client-side extraction
    // - Or a server-side API for more sophisticated analysis
    return {
      dominant: ['#2D5A87', '#8B4513', '#228B22'],
      accent: ['#FF6347', '#FFD700', '#9370DB'],
      neutral: ['#F5F5F5', '#696969', '#2F2F2F']
    }
  }

  const analyzeStyleMetadata = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/style/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl })
      })

      if (response.ok) {
        const analysis = await response.json()
        return analysis.styleMetadata || {}
      }
    } catch (error) {
      console.error('Style analysis failed:', error)
    }
    return {}
  }

  const uploadStyleReference = async () => {
    if (!selectedFile || !formData.name.trim()) return

    setIsUploading(true)
    setIsAnalyzing(true)

    try {
      // Upload image to Supabase storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('style-references')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('style-references')
        .getPublicUrl(fileName)

      setIsUploading(false)

      // Extract color palette and analyze style
      const [palette, styleAnalysis] = await Promise.all([
        extractColorPalette(publicUrl),
        analyzeStyleMetadata(publicUrl)
      ])

      setExtractedPalette(palette)
      setIsAnalyzing(false)

      // Create style reference record
      const styleMetadata = {
        ...styleAnalysis,
        mood: formData.mood || styleAnalysis.mood,
        lighting: formData.lighting || styleAnalysis.lighting,
        texture_style: formData.textureStyle || styleAnalysis.texture_style,
        art_style: formData.artStyle || styleAnalysis.art_style
      }

      const { data: styleRef, error: dbError } = await supabase
        .from('style_references')
        .insert({
          name: formData.name,
          description: formData.description,
          image_url: publicUrl,
          extracted_palette: palette,
          style_metadata: styleMetadata
        })
        .select()
        .single()

      if (dbError) throw dbError

      const newStyleRef: StyleReference = {
        id: styleRef.id,
        name: styleRef.name,
        description: styleRef.description,
        imageUrl: styleRef.image_url,
        extractedPalette: styleRef.extracted_palette,
        styleMetadata: styleRef.style_metadata,
        createdAt: styleRef.created_at
      }

      setStyleReferences(prev => [newStyleRef, ...prev])
      onStyleReferenceCreated?.(newStyleRef)

      // Reset form
      setSelectedFile(null)
      setPreviewUrl(null)
      setExtractedPalette(null)
      setFormData({
        name: '',
        description: '',
        mood: '',
        lighting: '',
        textureStyle: '',
        artStyle: ''
      })

    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  const deleteStyleReference = async (id: string) => {
    try {
      const { error } = await supabase
        .from('style_references')
        .delete()
        .eq('id', id)

      if (!error) {
        setStyleReferences(prev => prev.filter(ref => ref.id !== id))
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const ColorPaletteDisplay = ({ palette, title }: { palette: string[], title: string }) => (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{title}</Label>
      <div className="flex gap-1">
        {palette.map((color, index) => (
          <div
            key={index}
            className="w-6 h-6 rounded border border-neutral-200 dark:border-neutral-700 cursor-pointer tooltip"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Upload Style Reference
          </CardTitle>
          <CardDescription>
            Upload reference images to maintain consistent visual style across your assets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Reference Image</Label>
            <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-48 mx-auto rounded-lg"
                    />
                    <Button
                      onClick={() => {
                        setSelectedFile(null)
                        setPreviewUrl(null)
                      }}
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-neutral-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Reference Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Medieval Castle Style"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">Mood/Atmosphere</Label>
              <Input
                id="mood"
                value={formData.mood}
                onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
                placeholder="e.g. dark, mystical, cheerful"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lighting">Lighting Style</Label>
              <Input
                id="lighting"
                value={formData.lighting}
                onChange={(e) => setFormData(prev => ({ ...prev, lighting: e.target.value }))}
                placeholder="e.g. dramatic, soft, harsh"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artStyle">Art Style</Label>
              <Input
                id="artStyle"
                value={formData.artStyle}
                onChange={(e) => setFormData(prev => ({ ...prev, artStyle: e.target.value }))}
                placeholder="e.g. pixel art, realistic, cartoon"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the style characteristics..."
              className="min-h-20"
            />
          </div>

          {/* Extracted Palette Preview */}
          {extractedPalette && (
            <Card className="bg-neutral-50 dark:bg-neutral-900">
              <CardHeader>
                <CardTitle className="text-sm">Extracted Color Palette</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <ColorPaletteDisplay palette={extractedPalette.dominant} title="Dominant" />
                <ColorPaletteDisplay palette={extractedPalette.accent} title="Accent" />
                <ColorPaletteDisplay palette={extractedPalette.neutral} title="Neutral" />
              </CardContent>
            </Card>
          )}

          {/* Upload Button */}
          <Button
            onClick={uploadStyleReference}
            disabled={!selectedFile || !formData.name.trim() || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
                Uploading...
              </>
            ) : isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Style...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Create Style Reference
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Existing References */}
      {styleReferences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Style References</CardTitle>
            <CardDescription>
              Your uploaded style references for consistent asset generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {styleReferences.map((ref) => (
                  <Card key={ref.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={ref.imageUrl}
                        alt={ref.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button size="sm" variant="secondary" className="h-7 w-7 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="h-7 w-7 p-0"
                          onClick={() => deleteStyleReference(ref.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm mb-1">{ref.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {ref.description}
                      </p>
                      
                      {/* Style Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {ref.styleMetadata.mood && (
                          <Badge variant="outline" className="text-xs">
                            {ref.styleMetadata.mood}
                          </Badge>
                        )}
                        {ref.styleMetadata.art_style && (
                          <Badge variant="outline" className="text-xs">
                            {ref.styleMetadata.art_style}
                          </Badge>
                        )}
                      </div>

                      {/* Mini Palette */}
                      <div className="flex gap-1">
                        {ref.extractedPalette.dominant.slice(0, 4).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded border border-neutral-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
