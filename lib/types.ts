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
}
