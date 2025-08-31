-- Implement World Style system and proper asset types for Tessera
-- This transforms the basic asset generator into a proper game asset creation tool

-- Create world_styles table for style consistency
CREATE TABLE IF NOT EXISTS public.world_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  reference_images JSONB DEFAULT '[]'::jsonb, -- Array of reference image URLs
  extracted_palette JSONB DEFAULT '{}'::jsonb, -- Color palette data
  style_parameters JSONB DEFAULT '{}'::jsonb, -- Texture, perspective, line weight, etc.
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create asset_types table for different generation modes
CREATE TABLE IF NOT EXISTS public.asset_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'parallax', 'tileset', 'props', 'fx'
  display_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'environment', 'effects', 'objects'
  description TEXT,
  default_parameters JSONB DEFAULT '{}'::jsonb,
  export_formats JSONB DEFAULT '[]'::jsonb, -- Supported export formats
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default asset types
INSERT INTO public.asset_types (name, display_name, category, description, default_parameters, export_formats) VALUES
('parallax', 'Parallax Backgrounds', 'environment', 'Multi-layer scrolling backgrounds with depth', 
 '{"layers": 3, "depth_multiplier": 0.5, "seamless": true, "resolution": "1920x1080"}'::jsonb,
 '["png", "unity_sprite", "godot_texture"]'::jsonb),
('tileset', 'Tilesets', 'environment', 'Seamless tiles for level construction',
 '{"tile_size": "32x32", "grid_size": "8x8", "seamless": true, "collision_data": true}'::jsonb,
 '["png", "tmx", "tsx", "godot_tileset", "unity_tilemap"]'::jsonb),
('props', 'Props & Objects', 'objects', 'Individual game objects and decorations',
 '{"variations": 3, "include_shadows": true, "transparent_bg": true}'::jsonb,
 '["png", "sprite_atlas", "aseprite"]'::jsonb),
('fx', 'Visual Effects', 'effects', 'Animated effects and particles',
 '{"frame_count": 8, "loop": true, "frame_rate": 12, "sprite_sheet": true}'::jsonb,
 '["png", "gif", "sprite_sheet", "aseprite"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Add world_style_id and asset_type_id to asset_projects
ALTER TABLE public.asset_projects 
ADD COLUMN IF NOT EXISTS world_style_id UUID REFERENCES public.world_styles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS asset_type_id UUID REFERENCES public.asset_types(id) ON DELETE SET NULL;

-- Add asset_type_id to generated_assets
ALTER TABLE public.generated_assets
ADD COLUMN IF NOT EXISTS asset_type_id UUID REFERENCES public.asset_types(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS export_data JSONB DEFAULT '{}'::jsonb; -- Store export-ready metadata

-- Enable RLS on new tables
ALTER TABLE public.world_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for world_styles
CREATE POLICY "world_styles_select_own" ON public.world_styles FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "world_styles_insert_own" ON public.world_styles FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "world_styles_update_own" ON public.world_styles FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "world_styles_delete_own" ON public.world_styles FOR DELETE USING (auth.uid()::text = user_id);

-- RLS policies for asset_types (read-only for all authenticated users)
CREATE POLICY "asset_types_select_all" ON public.asset_types FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_world_styles_user_id ON public.world_styles(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_projects_world_style_id ON public.asset_projects(world_style_id);
CREATE INDEX IF NOT EXISTS idx_asset_projects_asset_type_id ON public.asset_projects(asset_type_id);
CREATE INDEX IF NOT EXISTS idx_generated_assets_asset_type_id ON public.generated_assets(asset_type_id);
