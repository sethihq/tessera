-- Simple authentication system migration
-- Drop Better Auth tables if they exist
DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Create simple auth tables
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "hashedPassword" text NOT NULL,
  "name" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

-- Update existing application tables to reference simple auth users
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "profiles" ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "asset_projects" DROP CONSTRAINT IF EXISTS asset_projects_user_id_fkey;
ALTER TABLE "asset_projects" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "asset_projects" ADD CONSTRAINT asset_projects_user_id_fkey FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "generated_assets" DROP CONSTRAINT IF EXISTS generated_assets_user_id_fkey;
ALTER TABLE "generated_assets" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "generated_assets" ADD CONSTRAINT generated_assets_user_id_fkey FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX IF NOT EXISTS "sessions_token_idx" ON "sessions"("token");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
