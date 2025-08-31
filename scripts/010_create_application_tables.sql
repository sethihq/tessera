-- Create application tables for AI game asset creator
-- These tables reference auth.users(id) and use RLS for security

-- Profiles table for user metadata
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Asset projects table
CREATE TABLE IF NOT EXISTS public.asset_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

-- Generated assets table
CREATE TABLE IF NOT EXISTS public.generated_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.asset_projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  parameters JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid()::text = user_id);

-- RLS policies for asset_projects
CREATE POLICY "asset_projects_select_own" ON public.asset_projects FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "asset_projects_insert_own" ON public.asset_projects FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "asset_projects_update_own" ON public.asset_projects FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "asset_projects_delete_own" ON public.asset_projects FOR DELETE USING (auth.uid()::text = user_id);

-- RLS policies for generated_assets
CREATE POLICY "generated_assets_select_own" ON public.generated_assets FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "generated_assets_insert_own" ON public.generated_assets FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "generated_assets_update_own" ON public.generated_assets FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "generated_assets_delete_own" ON public.generated_assets FOR DELETE USING (auth.uid()::text = user_id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL)
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
