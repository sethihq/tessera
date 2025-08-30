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
  style_reference_url: string | null
  created_at: string
  updated_at: string
}

export interface GeneratedAsset {
  id: string
  project_id: string
  user_id: string
  prompt: string
  image_url: string
  parameters: Record<string, any>
  status: "pending" | "generating" | "completed" | "failed"
  created_at: string
}

export interface GenerationParameters {
  style?: string
  quality?: "standard" | "hd"
  size?: "1024x1024" | "1792x1024" | "1024x1792"
  batch_size?: number
}
