-- Fix foreign key constraints to properly reference auth.users
-- Remove old Better Auth tables and fix user_id references

-- First, drop the old Better Auth tables since we're using Supabase auth
DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Ensure user_id columns are UUID type to match auth.users.id
ALTER TABLE "asset_projects" 
  ALTER COLUMN "user_id" TYPE uuid USING "user_id"::uuid;

ALTER TABLE "generated_assets" 
  ALTER COLUMN "user_id" TYPE uuid USING "user_id"::uuid;

ALTER TABLE "profiles" 
  ALTER COLUMN "user_id" TYPE uuid USING "user_id"::uuid;

-- Add proper foreign key constraints referencing auth.users
ALTER TABLE "asset_projects" 
  DROP CONSTRAINT IF EXISTS "asset_projects_user_id_user_id_fk",
  ADD CONSTRAINT "asset_projects_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "generated_assets" 
  DROP CONSTRAINT IF EXISTS "generated_assets_user_id_user_id_fk",
  ADD CONSTRAINT "generated_assets_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "profiles" 
  DROP CONSTRAINT IF EXISTS "profiles_user_id_user_id_fk",
  ADD CONSTRAINT "profiles_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Add foreign key constraint for project_id in generated_assets
ALTER TABLE "generated_assets" 
  DROP CONSTRAINT IF EXISTS "generated_assets_project_id_fkey",
  ADD CONSTRAINT "generated_assets_project_id_fkey" 
  FOREIGN KEY ("project_id") REFERENCES "asset_projects"("id") ON DELETE CASCADE;

-- Ensure RLS is enabled
ALTER TABLE "asset_projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "generated_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to use auth.uid()
DROP POLICY IF EXISTS "Users can manage their own projects" ON "asset_projects";
CREATE POLICY "Users can manage their own projects" ON "asset_projects"
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own assets" ON "generated_assets";
CREATE POLICY "Users can manage their own assets" ON "generated_assets"
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own profile" ON "profiles";
CREATE POLICY "Users can manage their own profile" ON "profiles"
  FOR ALL USING (auth.uid() = user_id);
