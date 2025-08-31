"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/origin-ui/card"
import { Label } from "@/components/origin-ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/origin-ui/select"
import { Input } from "@/components/origin-ui/input"
import { Textarea } from "@/components/origin-ui/textarea"
import { Badge } from "@/components/luxe-ui/badge"
import { Button } from "@/components/luxe-ui/button"
import { Separator } from "@/components/origin-ui/separator"
import { Switch } from "@/components/luxe-ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/origin-ui/tabs"
import { 
  SettingsIcon, 
  PlusIcon, 
  TrashIcon, 
  EyeIcon, 
  WandIcon,
  CheckIcon,
  PaletteIcon
} from "@/components/rounded-icons/icons"
import type { 
  SpriteSheet, 
  SpriteSheetFrame, 
  SpriteSheetFrameProperties 
} from "@/lib/types"

interface FrameEditorProps {
  frame: SpriteSheetFrame
  spriteSheet: SpriteSheet
  onFrameUpdate: (frameId: string, properties: Partial<SpriteSheetFrameProperties>) => void
}

export function FrameEditor({ frame, spriteSheet, onFrameUpdate }: FrameEditorProps) {
  const [localProperties, setLocalProperties] = useState<SpriteSheetFrameProperties>(frame.properties)
  const [hasChanges, setHasChanges] = useState(false)
  const [newAccessory, setNewAccessory] = useState("")
  const [newEffect, setNewEffect] = useState("")

  // Update local state when frame changes
  useEffect(() => {
    setLocalProperties(frame.properties)
    setHasChanges(false)
  }, [frame.id, frame.properties])

  // Handle property updates
  const updateProperty = (key: keyof SpriteSheetFrameProperties, value: any) => {
    setLocalProperties(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  // Handle nested property updates (e.g., color_variants)
  const updateNestedProperty = (
    parentKey: keyof SpriteSheetFrameProperties,
    childKey: string,
    value: any
  ) => {
    setLocalProperties(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as any),
        [childKey]: value
      }
    }))
    setHasChanges(true)
  }

  // Save changes
  const handleSave = () => {
    onFrameUpdate(frame.id, localProperties)
    setHasChanges(false)
  }

  // Reset changes
  const handleReset = () => {
    setLocalProperties(frame.properties)
    setHasChanges(false)
  }

  // Add accessory
  const addAccessory = () => {
    if (newAccessory.trim()) {
      const accessories = localProperties.accessories || []
      updateProperty("accessories", [...accessories, newAccessory.trim()])
      setNewAccessory("")
    }
  }

  // Remove accessory
  const removeAccessory = (index: number) => {
    const accessories = localProperties.accessories || []
    updateProperty("accessories", accessories.filter((_, i) => i !== index))
  }

  // Add special effect
  const addSpecialEffect = () => {
    if (newEffect.trim()) {
      const effects = localProperties.special_effects || []
      updateProperty("special_effects", [...effects, newEffect.trim()])
      setNewEffect("")
    }
  }

  // Remove special effect
  const removeSpecialEffect = (index: number) => {
    const effects = localProperties.special_effects || []
    updateProperty("special_effects", effects.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <SettingsIcon className="w-4 h-4" />
          Frame Editor
        </CardTitle>
        <CardDescription className="text-xs">
          Frame {frame.position.row + 1},{frame.position.col + 1}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save/Reset Controls */}
        {hasChanges && (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              size="sm"
              variant="elevated"
              className="flex items-center gap-1"
            >
              <CheckIcon className="w-3 h-3" />
              Save
            </Button>
            <Button
              onClick={handleReset}
              size="sm"
              variant="ghost"
            >
              Reset
            </Button>
          </div>
        )}

        <Tabs defaultValue="expression" className="w-full">
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="expression">Face</TabsTrigger>
            <TabsTrigger value="pose">Pose</TabsTrigger>
            <TabsTrigger value="appearance">Look</TabsTrigger>
            <TabsTrigger value="effects">FX</TabsTrigger>
          </TabsList>

          {/* Expression & Emotion Tab */}
          <TabsContent value="expression" className="space-y-3 mt-4">
            <div>
              <Label className="text-xs">Emotion</Label>
              <Select
                value={localProperties.emotion}
                onValueChange={(value) => updateProperty("emotion", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select emotion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="happy">Happy</SelectItem>
                  <SelectItem value="sad">Sad</SelectItem>
                  <SelectItem value="angry">Angry</SelectItem>
                  <SelectItem value="surprised">Surprised</SelectItem>
                  <SelectItem value="confused">Confused</SelectItem>
                  <SelectItem value="excited">Excited</SelectItem>
                  <SelectItem value="worried">Worried</SelectItem>
                  <SelectItem value="sleepy">Sleepy</SelectItem>
                  <SelectItem value="disgusted">Disgusted</SelectItem>
                  <SelectItem value="love">Love</SelectItem>
                  <SelectItem value="thinking">Thinking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Expression</Label>
              <Select
                value={localProperties.expression}
                onValueChange={(value) => updateProperty("expression", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select expression" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="smiling">Smiling</SelectItem>
                  <SelectItem value="frowning">Frowning</SelectItem>
                  <SelectItem value="scowling">Scowling</SelectItem>
                  <SelectItem value="shocked">Shocked</SelectItem>
                  <SelectItem value="puzzled">Puzzled</SelectItem>
                  <SelectItem value="grinning">Grinning</SelectItem>
                  <SelectItem value="concerned">Concerned</SelectItem>
                  <SelectItem value="drowsy">Drowsy</SelectItem>
                  <SelectItem value="disgusted">Disgusted</SelectItem>
                  <SelectItem value="loving">Loving</SelectItem>
                  <SelectItem value="pondering">Pondering</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Eyes</Label>
                <Select
                  value={localProperties.eye_state}
                  onValueChange={(value) => updateProperty("eye_state", value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Eye state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="half_closed">Half Closed</SelectItem>
                    <SelectItem value="wide">Wide</SelectItem>
                    <SelectItem value="squinting">Squinting</SelectItem>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                    <SelectItem value="angry">Angry</SelectItem>
                    <SelectItem value="worried">Worried</SelectItem>
                    <SelectItem value="bright">Bright</SelectItem>
                    <SelectItem value="heart_eyes">Heart Eyes</SelectItem>
                    <SelectItem value="focused">Focused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Mouth</Label>
                <Select
                  value={localProperties.mouth_state}
                  onValueChange={(value) => updateProperty("mouth_state", value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Mouth state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="smiling">Smiling</SelectItem>
                    <SelectItem value="frowning">Frowning</SelectItem>
                    <SelectItem value="speaking">Speaking</SelectItem>
                    <SelectItem value="shouting">Shouting</SelectItem>
                    <SelectItem value="surprised">Surprised</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Pose & Action Tab */}
          <TabsContent value="pose" className="space-y-3 mt-4">
            <div>
              <Label className="text-xs">Action</Label>
              <Select
                value={localProperties.action}
                onValueChange={(value) => updateProperty("action", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="walking">Walking</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="jumping">Jumping</SelectItem>
                  <SelectItem value="attacking">Attacking</SelectItem>
                  <SelectItem value="defending">Defending</SelectItem>
                  <SelectItem value="casting">Casting</SelectItem>
                  <SelectItem value="sitting">Sitting</SelectItem>
                  <SelectItem value="sleeping">Sleeping</SelectItem>
                  <SelectItem value="dancing">Dancing</SelectItem>
                  <SelectItem value="flying">Flying</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Pose</Label>
              <Select
                value={localProperties.pose}
                onValueChange={(value) => updateProperty("pose", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select pose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standing">Standing</SelectItem>
                  <SelectItem value="walking">Walking</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="sitting">Sitting</SelectItem>
                  <SelectItem value="lying">Lying</SelectItem>
                  <SelectItem value="crouching">Crouching</SelectItem>
                  <SelectItem value="jumping">Jumping</SelectItem>
                  <SelectItem value="attacking">Attacking</SelectItem>
                  <SelectItem value="defensive">Defensive</SelectItem>
                  <SelectItem value="ready_stance">Ready Stance</SelectItem>
                  <SelectItem value="triumphant">Triumphant</SelectItem>
                  <SelectItem value="recoiling">Recoiling</SelectItem>
                  <SelectItem value="dodging">Dodging</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Hand Position</Label>
                <Select
                  value={localProperties.hand_position}
                  onValueChange={(value) => updateProperty("hand_position", value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Hand position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="on_hips">On Hips</SelectItem>
                    <SelectItem value="crossed">Crossed</SelectItem>
                    <SelectItem value="raised">Raised</SelectItem>
                    <SelectItem value="pointing">Pointing</SelectItem>
                    <SelectItem value="weapon_ready">Weapon Ready</SelectItem>
                    <SelectItem value="spell_casting">Spell Casting</SelectItem>
                    <SelectItem value="waving">Waving</SelectItem>
                    <SelectItem value="clapping">Clapping</SelectItem>
                    <SelectItem value="blocking">Blocking</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Facing</Label>
                <Select
                  value={localProperties.facing_direction}
                  onValueChange={(value) => updateProperty("facing_direction", value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Front</SelectItem>
                    <SelectItem value="back">Back</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="three_quarter_left">3/4 Left</SelectItem>
                    <SelectItem value="three_quarter_right">3/4 Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Body Pose</Label>
              <Select
                value={localProperties.body_pose}
                onValueChange={(value) => updateProperty("body_pose", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Body pose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="confident">Confident</SelectItem>
                  <SelectItem value="shy">Shy</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                  <SelectItem value="tense">Tense</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="serious">Serious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-3 mt-4">
            <div>
              <Label className="text-xs">Clothing</Label>
              <Select
                value={localProperties.clothing}
                onValueChange={(value) => updateProperty("clothing", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select clothing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="armor">Armor</SelectItem>
                  <SelectItem value="robes">Robes</SelectItem>
                  <SelectItem value="athletic">Athletic</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="sci_fi">Sci-Fi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Outfit Variant</Label>
              <Select
                value={localProperties.outfit_variant}
                onValueChange={(value) => updateProperty("outfit_variant", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Outfit variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="t_shirt_jeans">T-shirt & Jeans</SelectItem>
                  <SelectItem value="suit">Suit</SelectItem>
                  <SelectItem value="leather_armor">Leather Armor</SelectItem>
                  <SelectItem value="mage_robes">Mage Robes</SelectItem>
                  <SelectItem value="sports_wear">Sports Wear</SelectItem>
                  <SelectItem value="coat_scarf">Coat & Scarf</SelectItem>
                  <SelectItem value="dress">Dress</SelectItem>
                  <SelectItem value="uniform">Uniform</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Hairstyle</Label>
              <Select
                value={localProperties.hairstyle}
                onValueChange={(value) => updateProperty("hairstyle", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select hairstyle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="ponytail">Ponytail</SelectItem>
                  <SelectItem value="braids">Braids</SelectItem>
                  <SelectItem value="curly">Curly</SelectItem>
                  <SelectItem value="spiky">Spiky</SelectItem>
                  <SelectItem value="bald">Bald</SelectItem>
                  <SelectItem value="hat_covered">Hat Covered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Accessories */}
            <div>
              <Label className="text-xs">Accessories</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add accessory..."
                    value={newAccessory}
                    onChange={(e) => setNewAccessory(e.target.value)}
                    className="h-8"
                    onKeyPress={(e) => e.key === 'Enter' && addAccessory()}
                  />
                  <Button
                    onClick={addAccessory}
                    size="sm"
                    variant="ghost"
                    className="px-2"
                  >
                    <PlusIcon className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(localProperties.accessories || []).map((accessory, index) => (
                    <Badge
                      key={index}
                      variant="muted"
                      className="text-xs px-2 py-1 flex items-center gap-1"
                    >
                      {accessory}
                      <button
                        onClick={() => removeAccessory(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <TrashIcon className="w-2 h-2" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Color Variants */}
            <Separator />
            <div>
              <Label className="text-xs flex items-center gap-1">
                <PaletteIcon className="w-3 h-3" />
                Color Overrides
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-xs">Accent Color</Label>
                  <Input
                    type="color"
                    value={localProperties.color_variants?.accent_color || "#000000"}
                    onChange={(e) => updateNestedProperty("color_variants", "accent_color", e.target.value)}
                    className="h-8 w-full"
                  />
                </div>
                <div>
                  <Label className="text-xs">Eye Color</Label>
                  <Select
                    value={localProperties.color_variants?.eye_color}
                    onValueChange={(value) => updateNestedProperty("color_variants", "eye_color", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Eye color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brown">Brown</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="hazel">Hazel</SelectItem>
                      <SelectItem value="gray">Gray</SelectItem>
                      <SelectItem value="amber">Amber</SelectItem>
                      <SelectItem value="violet">Violet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-3 mt-4">
            <div>
              <Label className="text-xs">Background</Label>
              <Select
                value={localProperties.background}
                onValueChange={(value) => updateProperty("background", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Background type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transparent">Transparent</SelectItem>
                  <SelectItem value="solid_color">Solid Color</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                  <SelectItem value="simple_pattern">Simple Pattern</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Special Effects */}
            <div>
              <Label className="text-xs">Special Effects</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add effect..."
                    value={newEffect}
                    onChange={(e) => setNewEffect(e.target.value)}
                    className="h-8"
                    onKeyPress={(e) => e.key === 'Enter' && addSpecialEffect()}
                  />
                  <Button
                    onClick={addSpecialEffect}
                    size="sm"
                    variant="ghost"
                    className="px-2"
                  >
                    <PlusIcon className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(localProperties.special_effects || []).map((effect, index) => (
                    <Badge
                      key={index}
                      variant="muted"
                      className="text-xs px-2 py-1 flex items-center gap-1"
                    >
                      {effect}
                      <button
                        onClick={() => removeSpecialEffect(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <TrashIcon className="w-2 h-2" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-neutral-500">
                  Suggestions: glow, shadow, particles, magic_aura, speed_lines, impact_effect
                </div>
              </div>
            </div>

            {/* Generation Hints */}
            <Separator />
            <div>
              <Label className="text-xs">Generation Priority</Label>
              <Select
                value={localProperties.generation_hints?.consistency_priority}
                onValueChange={(value) => updateNestedProperty("generation_hints", "consistency_priority", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Priority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Consistency</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Creative Freedom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Detail Level</Label>
              <Select
                value={localProperties.generation_hints?.detail_level}
                onValueChange={(value) => updateNestedProperty("generation_hints", "detail_level", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Detail level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        {/* Frame Status */}
        <Separator />
        <div className="flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            Status: {frame.status}
          </div>
          {frame.image_url && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs flex items-center gap-1"
            >
              <EyeIcon className="w-3 h-3" />
              View Image
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
