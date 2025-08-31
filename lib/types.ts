export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface AssetProject {
  id: string
  user_id: string
  name: string
  description: string | null
  world_style_id: string | null
  asset_type_id: string | null
  created_at: string
  updated_at: string
  // Relations
  world_style?: WorldStyle
  asset_type?: AssetType
}

export interface GeneratedAsset {
  id: string
  project_id: string
  user_id: string
  prompt: string
  image_url: string
  parameters: Record<string, any>
  asset_type_id: string | null
  export_data: {
    tile_size?: string
    collision_data?: any
    animation_frames?: number
    parallax_layers?: any[]
    metadata?: Record<string, any>
  }
  status: "pending" | "generating" | "completed" | "failed"
  created_at: string
  // Relations
  asset_type?: AssetType
}

export interface GenerationParameters {
  // Common parameters
  style?: string
  quality?: "standard" | "hd"
  size?: "1024x1024" | "1792x1024" | "1024x1792"

  // Parallax-specific
  layers?: number
  depth_multiplier?: number

  // Tileset-specific
  tile_size?: "16x16" | "32x32" | "64x64" | "128x128"
  grid_size?: string
  seamless?: boolean
  collision_data?: boolean

  // Props-specific
  variations?: number
  include_shadows?: boolean
  transparent_bg?: boolean

  // FX-specific
  frame_count?: number
  loop?: boolean
  frame_rate?: number
  sprite_sheet?: boolean
}

export interface WorldStyle {
  id: string
  user_id: string
  name: string
  description: string | null
  reference_images: string[] // Array of reference image URLs
  extracted_palette: {
    primary: string[]
    secondary: string[]
    accent: string[]
  }
  style_parameters: {
    texture_style?: "pixel" | "painted" | "realistic" | "cartoon"
    line_weight?: "thin" | "medium" | "thick"
    perspective?: "top_down" | "side_view" | "isometric" | "3d"
    lighting?: "flat" | "ambient" | "dramatic" | "realistic"
    detail_level?: "minimal" | "moderate" | "detailed" | "highly_detailed"
  }
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface AssetType {
  id: string
  name: "parallax" | "tileset" | "props" | "fx"
  display_name: string
  category: "environment" | "effects" | "objects"
  description: string
  default_parameters: Record<string, any>
  export_formats: string[]
  created_at: string
}

export interface ExportFormat {
  format: string
  name: string
  description: string
  file_extension: string
  supports_metadata: boolean
  game_engines: string[]
}

export const EXPORT_FORMATS: Record<string, ExportFormat> = {
  png: {
    format: "png",
    name: "PNG Image",
    description: "Standard PNG image format",
    file_extension: ".png",
    supports_metadata: false,
    game_engines: ["Unity", "Godot", "Phaser", "GameMaker"],
  },
  tmx: {
    format: "tmx",
    name: "Tiled Map",
    description: "Tiled map editor format with collision data",
    file_extension: ".tmx",
    supports_metadata: true,
    game_engines: ["Tiled", "Godot", "Phaser"],
  },
  unity_sprite: {
    format: "unity_sprite",
    name: "Unity Sprite Atlas",
    description: "Unity-ready sprite atlas with metadata",
    file_extension: ".asset",
    supports_metadata: true,
    game_engines: ["Unity"],
  },
  godot_tileset: {
    format: "godot_tileset",
    name: "Godot Tileset",
    description: "Godot tileset resource with collision shapes",
    file_extension: ".tres",
    supports_metadata: true,
    game_engines: ["Godot"],
  },
  aseprite: {
    format: "aseprite",
    name: "Aseprite File",
    description: "Aseprite format with animation data",
    file_extension: ".ase",
    supports_metadata: true,
    game_engines: ["Aseprite", "Unity", "Godot"],
  },
  sprite_sheet: {
    format: "sprite_sheet",
    name: "Sprite Sheet",
    description: "Multi-frame sprite sheet with transparent background",
    file_extension: ".png",
    supports_metadata: true,
    game_engines: ["Unity", "Godot", "Phaser", "GameMaker", "Aseprite"],
  },
}

// ===== SPRITE SHEET SYSTEM TYPES =====

export interface SpriteSheetFrameProperties {
  // Character expression and emotion
  emotion?: "neutral" | "happy" | "sad" | "angry" | "surprised" | "confused" | "excited" | "worried" | "sleepy" | "disgusted" | "love" | "thinking"
  expression?: "default" | "smiling" | "frowning" | "scowling" | "shocked" | "puzzled" | "grinning" | "concerned" | "drowsy" | "disgusted" | "loving" | "pondering"
  facial_expression?: "neutral" | "smile" | "frown" | "wink" | "tongue_out" | "raised_eyebrow" | "pursed_lips"
  eye_state?: "open" | "closed" | "half_closed" | "wide" | "squinting" | "happy" | "sad" | "angry" | "worried" | "bright" | "heart_eyes" | "focused"
  mouth_state?: "closed" | "open" | "smiling" | "frowning" | "speaking" | "shouting" | "surprised"

  // Character clothing and appearance
  clothing?: "base" | "casual" | "formal" | "armor" | "robes" | "athletic" | "winter" | "summer" | "fantasy" | "sci_fi"
  outfit_variant?: "default" | "t_shirt_jeans" | "suit" | "leather_armor" | "mage_robes" | "sports_wear" | "coat_scarf" | "dress" | "uniform"
  hairstyle?: "base" | "short" | "long" | "ponytail" | "braids" | "curly" | "spiky" | "bald" | "hat_covered"
  accessories?: string[] // ["hat", "glasses", "earrings", "necklace", "gloves", "boots", "weapon", "shield", "staff"]

  // Character pose and action
  action?: "idle" | "walking" | "running" | "jumping" | "attacking" | "defending" | "casting" | "sitting" | "sleeping" | "dancing" | "flying"
  pose?: "standing" | "walking" | "running" | "sitting" | "lying" | "crouching" | "jumping" | "attacking" | "defensive" | "ready_stance" | "triumphant" | "recoiling" | "dodging"
  body_pose?: "neutral" | "confident" | "shy" | "aggressive" | "relaxed" | "tense" | "playful" | "serious"
  hand_position?: "default" | "on_hips" | "crossed" | "raised" | "pointing" | "weapon_ready" | "spell_casting" | "waving" | "clapping" | "blocking" | "balanced"
  facing_direction?: "front" | "back" | "left" | "right" | "three_quarter_left" | "three_quarter_right"

  // Animation-specific properties
  leg_position?: "neutral" | "step_left" | "step_right" | "step_left_back" | "step_right_back" | "together" | "wide_stance"
  
  // Environment and effects
  background?: "transparent" | "solid_color" | "gradient" | "simple_pattern" | "none"
  special_effects?: string[] // ["glow", "shadow", "particles", "magic_aura", "speed_lines", "impact_effect"]
  
  // Color and styling
  color_variants?: {
    skin_tone?: "pale" | "light" | "medium" | "dark" | "fantasy_blue" | "fantasy_green" | "fantasy_purple"
    hair_color?: "black" | "brown" | "blonde" | "red" | "white" | "blue" | "green" | "purple" | "pink"
    accent_color?: string // Hex color for clothing/accessories
    eye_color?: "brown" | "blue" | "green" | "hazel" | "gray" | "amber" | "violet"
  }

  // Custom modifiers for advanced users
  custom_modifiers?: string[]
  
  // Frame-specific generation hints
  generation_hints?: {
    consistency_priority?: "high" | "medium" | "low"
    detail_level?: "minimal" | "moderate" | "detailed"
    style_emphasis?: string
  }

  [key: string]: any // Allow for future extensibility
}

export interface SpriteSheetFrame {
  id: string
  sprite_sheet_id: string
  position: { row: number; col: number }
  properties: SpriteSheetFrameProperties
  prompt: string
  image_url?: string
  status: "pending" | "generating" | "completed" | "error"
  generation_metadata: Record<string, any>
  generation_parameters: {
    style: string
    quality: "standard" | "hd"
    background: "transparent" | "solid"
    format: "png" | "webp"
  }
  error_message?: string
  created_at: string
  updated_at: string
}

export interface SpriteSheetBaseCharacter {
  description: string
  art_style: "pixel" | "cartoon" | "realistic" | "anime" | "chibi" | "low_poly" | "hand_drawn" | "vector"
  character_type: "humanoid" | "creature" | "robot" | "animal" | "fantasy_being" | "monster"
  base_properties: {
    body_type?: "slim" | "medium" | "muscular" | "large" | "child" | "elder"
    skin_tone?: "pale" | "light" | "medium" | "dark" | "fantasy_blue" | "fantasy_green" | "fantasy_purple"
    hair_color?: "black" | "brown" | "blonde" | "red" | "white" | "blue" | "green" | "purple" | "pink"
    clothing_style?: "casual" | "formal" | "fantasy" | "sci_fi" | "medieval" | "modern" | "athletic" | "elegant"
    default_expression?: "neutral" | "friendly" | "serious" | "playful" | "mysterious" | "heroic" | "villainous"
    size_category?: "tiny" | "small" | "medium" | "large" | "huge"
  }
}

export interface SpriteSheetDimensions {
  rows: number
  cols: number
}

export interface SpriteSheetFrameSize {
  width: number
  height: number
}

export interface SpriteSheetOutputSettings {
  background: "transparent" | "solid"
  format: "png" | "webp"
  spacing: number // Pixels between frames
  border: number // Border pixels around each frame
  quality: "standard" | "high" | "ultra"
  optimization: "file_size" | "quality" | "game_ready"
}

export interface SpriteSheetGenerationProgress {
  completed_frames: number
  total_frames: number
  current_frame?: string
  estimated_time_remaining?: number
  errors?: string[]
}

export interface SpriteSheet {
  id: string
  user_id: string
  project_id?: string
  world_style_id?: string
  name: string
  description?: string
  base_character: SpriteSheetBaseCharacter
  dimensions: SpriteSheetDimensions
  frame_size: SpriteSheetFrameSize
  output_settings: SpriteSheetOutputSettings
  status: "draft" | "generating" | "completed" | "error"
  final_image_url?: string
  generation_progress: SpriteSheetGenerationProgress
  frames: SpriteSheetFrame[]
  created_at: string
  updated_at: string
}

export interface SpriteSheetTemplate {
  id: string
  name: string
  description: string
  category: "animation" | "emotions" | "outfits" | "actions" | "poses" | "expressions" | "combat" | "magic" | "social"
  template_data: {
    frames: Array<{
      position: { row: number; col: number }
      properties: SpriteSheetFrameProperties
    }>
  }
  dimensions: SpriteSheetDimensions
  frame_size: SpriteSheetFrameSize
  is_public: boolean
  created_by?: string
  created_at: string
}

// API request/response types for sprite sheet operations
export interface CreateSpriteSheetRequest {
  name: string
  description?: string
  project_id?: string
  world_style_id?: string
  base_character: SpriteSheetBaseCharacter
  dimensions: SpriteSheetDimensions
  frame_size: SpriteSheetFrameSize
  output_settings?: Partial<SpriteSheetOutputSettings>
  template_id?: string // If creating from template
}

export interface UpdateFramePropertiesRequest {
  frame_id: string
  properties: Partial<SpriteSheetFrameProperties>
}

export interface GenerateSpriteSheetRequest {
  sprite_sheet_id: string
  frame_ids?: string[] // If only generating specific frames
  priority?: "quality" | "speed"
}

export interface SpriteSheetExportOptions {
  format: "png" | "webp" | "gif" | "sprite_atlas" | "json"
  include_metadata: boolean
  include_individual_frames: boolean
  custom_spacing?: number
  custom_frame_size?: SpriteSheetFrameSize
  game_engine_preset?: "unity" | "godot" | "phaser" | "gamemaker" | "aseprite"
}
