"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PaletteIconIcon, EyeIconIcon, PlusIconIcon, TrashIcon } from "@/components/rounded-icons/icons"
import type { WorldStyle } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface WorldStyleManagerProps {
  onStyleSelect: (style: WorldStyle) => void
  selectedStyleId?: string
}

export function WorldStyleManager({ onStyleSelect, selectedStyleId }: WorldStyleManagerProps) {
  const [worldStyles, setWorldStyles] = useState<WorldStyle[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newStyle, setNewStyle] = useState({
    name: "",
    description: "",
    reference_images: [] as string[],
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchWorldStyles()
  }, [])

  const fetchWorldStyles = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("world_styles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setWorldStyles(data || [])
    } catch (error) {
      console.error("Error fetching world styles:", error)
    } finally {
      setLoading(false)
    }
  }

  const createWorldStyle = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("world_styles")
        .insert({
          user_id: user.id,
          name: newStyle.name,
          description: newStyle.description,
          reference_images: newStyle.reference_images,
          extracted_palette: { primary: [], secondary: [], accent: [] },
          style_parameters: {
            texture_style: "painted",
            line_weight: "medium",
            perspective: "side_view",
            lighting: "ambient",
            detail_level: "moderate",
          },
        })
        .select()
        .single()

      if (error) throw error

      setWorldStyles([data, ...worldStyles])
      setNewStyle({ name: "", description: "", reference_images: [] })
      setIsCreating(false)
    } catch (error) {
      console.error("Error creating world style:", error)
    }
  }

  const deleteWorldStyle = async (id: string) => {
    try {
      const { error } = await supabase.from("world_styles").delete().eq("id", id)

      if (error) throw error
      setWorldStyles(worldStyles.filter((style) => style.id !== id))
    } catch (error) {
      console.error("Error deleting world style:", error)
    }
  }

  if (loading) {
    return (
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
            <div className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">World Styles</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Define consistent visual styles for your game assets
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-[#FF6600] hover:bg-[#E55A00] text-white">
          <PlusIcon className="w-4 h-4 mr-2" />
          New Style
        </Button>
      </div>

      {isCreating && (
        <Card className="border-[#FF6600]/20 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-neutral-100">Create World Style</CardTitle>
            <CardDescription>Upload reference images to extract consistent visual parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="style-name">Style Name</Label>
              <Input
                id="style-name"
                value={newStyle.name}
                onChange={(e) => setNewStyle({ ...newStyle, name: e.target.value })}
                placeholder="e.g., Cyberpunk City, Fantasy Forest"
                className="border-neutral-200 dark:border-neutral-800"
              />
            </div>
            <div>
              <Label htmlFor="style-description">Description</Label>
              <Textarea
                id="style-description"
                value={newStyle.description}
                onChange={(e) => setNewStyle({ ...newStyle, description: e.target.value })}
                placeholder="Describe the visual style and mood..."
                className="border-neutral-200 dark:border-neutral-800"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={createWorldStyle}
                disabled={!newStyle.name}
                className="bg-[#FF6600] hover:bg-[#E55A00] text-white"
              >
                Create Style
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
                className="border-neutral-200 dark:border-neutral-800"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {worldStyles.map((style) => (
          <Card
            key={style.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedStyleId === style.id
                ? "border-[#FF6600] bg-[#FF6600]/5"
                : "border-neutral-200 dark:border-neutral-800 hover:border-[#FF6600]/50"
            }`}
            onClick={() => onStyleSelect(style)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {style.name}
                  </CardTitle>
                  {style.description && <CardDescription className="text-xs mt-1">{style.description}</CardDescription>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteWorldStyle(style.id)
                  }}
                  className="h-6 w-6 p-0 text-neutral-400 hover:text-red-500"
                >
                  <TrashIcon className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                <PaletteIcon className="w-3 h-3" />
                <span>{style.extracted_palette.primary?.length || 0} colors</span>
                <EyeIcon className="w-3 h-3 ml-2" />
                <span>{style.reference_images?.length || 0} refs</span>
              </div>
              {style.style_parameters && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(style.style_parameters)
                    .slice(0, 3)
                    .map(([key, value]) => (
                      <Badge
                        key={key}
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                      >
                        {String(value)}
                      </Badge>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {worldStyles.length === 0 && !isCreating && (
        <Card className="border-dashed border-2 border-neutral-300 dark:border-neutral-700">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <PaletteIcon className="w-12 h-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No World Styles Yet</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-sm">
              Create your first world style to ensure visual consistency across all your game assets.
            </p>
            <Button onClick={() => setIsCreating(true)} className="bg-[#FF6600] hover:bg-[#E55A00] text-white">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create World Style
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
