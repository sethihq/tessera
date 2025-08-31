-- Create Sprite Sheet System for Advanced Character Animation
-- Enables frame-by-frame manipulation of character sprites with transparent backgrounds

-- Sprite sheet configurations table
CREATE TABLE IF NOT EXISTS public.sprite_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.asset_projects(id) ON DELETE SET NULL,
  world_style_id UUID REFERENCES public.world_styles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Base character definition
  base_character JSONB NOT NULL DEFAULT '{
    "description": "",
    "art_style": "pixel",
    "character_type": "humanoid",
    "base_properties": {
      "body_type": "medium",
      "skin_tone": "medium",
      "hair_color": "brown",
      "clothing_style": "casual",
      "default_expression": "neutral"
    }
  }'::jsonb,
  
  -- Grid dimensions and sizing
  dimensions JSONB NOT NULL DEFAULT '{"rows": 4, "cols": 4}'::jsonb,
  frame_size JSONB NOT NULL DEFAULT '{"width": 64, "height": 64}'::jsonb,
  
  -- Output configuration
  output_settings JSONB DEFAULT '{
    "background": "transparent",
    "format": "png",
    "spacing": 2,
    "border": 1,
    "quality": "high",
    "optimization": "game_ready"
  }'::jsonb,
  
  -- Generation status and results
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'error')),
  final_image_url TEXT,
  generation_progress JSONB DEFAULT '{"completed_frames": 0, "total_frames": 0, "current_frame": null}'::jsonb,
  
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

-- Individual sprite sheet frames with detailed properties
CREATE TABLE IF NOT EXISTS public.sprite_sheet_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprite_sheet_id UUID NOT NULL REFERENCES public.sprite_sheets(id) ON DELETE CASCADE,
  
  -- Grid position
  position JSONB NOT NULL, -- {"row": 0, "col": 0}
  
  -- Frame-specific customizable properties
  properties JSONB NOT NULL DEFAULT '{
    "emotion": "neutral",
    "expression": "default",
    "clothing": "base",
    "hairstyle": "base",
    "pose": "idle",
    "action": "standing",
    "facing_direction": "front",
    "accessories": [],
    "outfit_variant": "default",
    "facial_expression": "neutral",
    "body_pose": "neutral",
    "hand_position": "default",
    "eye_state": "open",
    "mouth_state": "closed",
    "special_effects": [],
    "color_variants": {},
    "custom_modifiers": []
  }'::jsonb,
  
  -- Generated content
  prompt TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  
  -- Generation metadata
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'error')),
  generation_metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  
  -- AI generation parameters specific to this frame
  generation_parameters JSONB DEFAULT '{
    "style": "consistent",
    "quality": "high",
    "background": "transparent",
    "format": "png"
  }'::jsonb,
  
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure unique position per sprite sheet
  UNIQUE(sprite_sheet_id, position)
);

-- Sprite sheet templates for common use cases
CREATE TABLE IF NOT EXISTS public.sprite_sheet_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'animation', 'emotions', 'outfits', 'actions'
  template_data JSONB NOT NULL, -- Pre-configured frames and properties
  dimensions JSONB NOT NULL,
  frame_size JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default sprite sheet templates
INSERT INTO public.sprite_sheet_templates (name, description, category, template_data, dimensions, frame_size) VALUES
('Walking Cycle', '8-frame walking animation cycle', 'animation', '{
  "frames": [
    {"position": {"row": 0, "col": 0}, "properties": {"action": "walk_1", "pose": "walking", "leg_position": "step_left"}},
    {"position": {"row": 0, "col": 1}, "properties": {"action": "walk_2", "pose": "walking", "leg_position": "neutral"}},
    {"position": {"row": 0, "col": 2}, "properties": {"action": "walk_3", "pose": "walking", "leg_position": "step_right"}},
    {"position": {"row": 0, "col": 3}, "properties": {"action": "walk_4", "pose": "walking", "leg_position": "neutral"}},
    {"position": {"row": 1, "col": 0}, "properties": {"action": "walk_5", "pose": "walking", "leg_position": "step_left_back"}},
    {"position": {"row": 1, "col": 1}, "properties": {"action": "walk_6", "pose": "walking", "leg_position": "neutral"}},
    {"position": {"row": 1, "col": 2}, "properties": {"action": "walk_7", "pose": "walking", "leg_position": "step_right_back"}},
    {"position": {"row": 1, "col": 3}, "properties": {"action": "walk_8", "pose": "walking", "leg_position": "neutral"}}
  ]
}'::jsonb, '{"rows": 2, "cols": 4}'::jsonb, '{"width": 64, "height": 64}'::jsonb),

('Emotion Set', '12 different facial expressions', 'emotions', '{
  "frames": [
    {"position": {"row": 0, "col": 0}, "properties": {"emotion": "happy", "expression": "smiling", "eye_state": "happy"}},
    {"position": {"row": 0, "col": 1}, "properties": {"emotion": "sad", "expression": "frowning", "eye_state": "sad"}},
    {"position": {"row": 0, "col": 2}, "properties": {"emotion": "angry", "expression": "scowling", "eye_state": "angry"}},
    {"position": {"row": 0, "col": 3}, "properties": {"emotion": "surprised", "expression": "shocked", "eye_state": "wide"}},
    {"position": {"row": 1, "col": 0}, "properties": {"emotion": "confused", "expression": "puzzled", "eye_state": "squinting"}},
    {"position": {"row": 1, "col": 1}, "properties": {"emotion": "excited", "expression": "grinning", "eye_state": "bright"}},
    {"position": {"row": 1, "col": 2}, "properties": {"emotion": "worried", "expression": "concerned", "eye_state": "worried"}},
    {"position": {"row": 1, "col": 3}, "properties": {"emotion": "sleepy", "expression": "drowsy", "eye_state": "half_closed"}},
    {"position": {"row": 2, "col": 0}, "properties": {"emotion": "disgusted", "expression": "disgusted", "eye_state": "squinting"}},
    {"position": {"row": 2, "col": 1}, "properties": {"emotion": "love", "expression": "loving", "eye_state": "heart_eyes"}},
    {"position": {"row": 2, "col": 2}, "properties": {"emotion": "neutral", "expression": "default", "eye_state": "open"}},
    {"position": {"row": 2, "col": 3}, "properties": {"emotion": "thinking", "expression": "pondering", "eye_state": "focused"}}
  ]
}'::jsonb, '{"rows": 3, "cols": 4}'::jsonb, '{"width": 64, "height": 64}'::jsonb),

('Combat Actions', '8 combat poses and actions', 'actions', '{
  "frames": [
    {"position": {"row": 0, "col": 0}, "properties": {"action": "idle", "pose": "ready_stance", "hand_position": "weapon_ready"}},
    {"position": {"row": 0, "col": 1}, "properties": {"action": "attack_1", "pose": "attacking", "hand_position": "swing_start"}},
    {"position": {"row": 0, "col": 2}, "properties": {"action": "attack_2", "pose": "attacking", "hand_position": "swing_mid"}},
    {"position": {"row": 0, "col": 3}, "properties": {"action": "attack_3", "pose": "attacking", "hand_position": "swing_end"}},
    {"position": {"row": 1, "col": 0}, "properties": {"action": "block", "pose": "defensive", "hand_position": "blocking"}},
    {"position": {"row": 1, "col": 1}, "properties": {"action": "dodge", "pose": "dodging", "hand_position": "balanced"}},
    {"position": {"row": 1, "col": 2}, "properties": {"action": "hit", "pose": "recoiling", "hand_position": "defensive"}},
    {"position": {"row": 1, "col": 3}, "properties": {"action": "victory", "pose": "triumphant", "hand_position": "raised"}}
  ]
}'::jsonb, '{"rows": 2, "cols": 4}'::jsonb, '{"width": 64, "height": 64}'::jsonb),

('Outfit Variants', '6 different clothing styles', 'outfits', '{
  "frames": [
    {"position": {"row": 0, "col": 0}, "properties": {"clothing": "casual", "outfit_variant": "t_shirt_jeans", "accessories": ["sneakers"]}},
    {"position": {"row": 0, "col": 1}, "properties": {"clothing": "formal", "outfit_variant": "suit", "accessories": ["dress_shoes", "tie"]}},
    {"position": {"row": 0, "col": 2}, "properties": {"clothing": "armor", "outfit_variant": "leather_armor", "accessories": ["sword", "shield"]}},
    {"position": {"row": 1, "col": 0}, "properties": {"clothing": "robes", "outfit_variant": "mage_robes", "accessories": ["staff", "hat"]}},
    {"position": {"row": 1, "col": 1}, "properties": {"clothing": "athletic", "outfit_variant": "sports_wear", "accessories": ["headband", "sneakers"]}},
    {"position": {"row": 1, "col": 2}, "properties": {"clothing": "winter", "outfit_variant": "coat_scarf", "accessories": ["gloves", "boots"]}}
  ]
}'::jsonb, '{"rows": 2, "cols": 3}'::jsonb, '{"width": 64, "height": 64}'::jsonb)
ON CONFLICT DO NOTHING;

-- Enable RLS on all new tables
ALTER TABLE public.sprite_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprite_sheet_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprite_sheet_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for sprite_sheets
CREATE POLICY "sprite_sheets_select_own" ON public.sprite_sheets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sprite_sheets_insert_own" ON public.sprite_sheets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sprite_sheets_update_own" ON public.sprite_sheets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sprite_sheets_delete_own" ON public.sprite_sheets FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for sprite_sheet_frames
CREATE POLICY "sprite_sheet_frames_select_own" ON public.sprite_sheet_frames FOR SELECT 
  USING (auth.uid() = (SELECT user_id FROM public.sprite_sheets WHERE id = sprite_sheet_id));
CREATE POLICY "sprite_sheet_frames_insert_own" ON public.sprite_sheet_frames FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.sprite_sheets WHERE id = sprite_sheet_id));
CREATE POLICY "sprite_sheet_frames_update_own" ON public.sprite_sheet_frames FOR UPDATE 
  USING (auth.uid() = (SELECT user_id FROM public.sprite_sheets WHERE id = sprite_sheet_id));
CREATE POLICY "sprite_sheet_frames_delete_own" ON public.sprite_sheet_frames FOR DELETE 
  USING (auth.uid() = (SELECT user_id FROM public.sprite_sheets WHERE id = sprite_sheet_id));

-- RLS policies for sprite_sheet_templates (public read, authenticated create)
CREATE POLICY "sprite_sheet_templates_select_all" ON public.sprite_sheet_templates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "sprite_sheet_templates_insert_own" ON public.sprite_sheet_templates FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "sprite_sheet_templates_update_own" ON public.sprite_sheet_templates FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "sprite_sheet_templates_delete_own" ON public.sprite_sheet_templates FOR DELETE USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS sprite_sheets_user_id_idx ON public.sprite_sheets(user_id);
CREATE INDEX IF NOT EXISTS sprite_sheets_project_id_idx ON public.sprite_sheets(project_id);
CREATE INDEX IF NOT EXISTS sprite_sheets_status_idx ON public.sprite_sheets(status);

CREATE INDEX IF NOT EXISTS sprite_sheet_frames_sprite_sheet_id_idx ON public.sprite_sheet_frames(sprite_sheet_id);
CREATE INDEX IF NOT EXISTS sprite_sheet_frames_status_idx ON public.sprite_sheet_frames(status);
CREATE INDEX IF NOT EXISTS sprite_sheet_frames_position_idx ON public.sprite_sheet_frames USING GIN(position);

CREATE INDEX IF NOT EXISTS sprite_sheet_templates_category_idx ON public.sprite_sheet_templates(category);

-- Create function to auto-generate frames when sprite sheet is created
CREATE OR REPLACE FUNCTION generate_sprite_sheet_frames()
RETURNS TRIGGER AS $$
DECLARE
    row_num INTEGER;
    col_num INTEGER;
    total_rows INTEGER;
    total_cols INTEGER;
BEGIN
    -- Extract dimensions from the sprite sheet
    total_rows := (NEW.dimensions->>'rows')::INTEGER;
    total_cols := (NEW.dimensions->>'cols')::INTEGER;
    
    -- Generate frames for each position in the grid
    FOR row_num IN 0..(total_rows - 1) LOOP
        FOR col_num IN 0..(total_cols - 1) LOOP
            INSERT INTO public.sprite_sheet_frames (
                sprite_sheet_id,
                position,
                properties,
                prompt,
                status
            ) VALUES (
                NEW.id,
                json_build_object('row', row_num, 'col', col_num),
                '{"emotion": "neutral", "expression": "default", "clothing": "base", "pose": "idle"}'::jsonb,
                'Base frame - customize properties to generate',
                'pending'
            );
        END LOOP;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate frames
CREATE TRIGGER trigger_generate_sprite_sheet_frames
    AFTER INSERT ON public.sprite_sheets
    FOR EACH ROW
    EXECUTE FUNCTION generate_sprite_sheet_frames();

-- Update function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER trigger_sprite_sheets_updated_at BEFORE UPDATE ON public.sprite_sheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_sprite_sheet_frames_updated_at BEFORE UPDATE ON public.sprite_sheet_frames FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
