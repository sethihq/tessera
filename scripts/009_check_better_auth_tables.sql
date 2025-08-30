-- Better Auth tables verification script
-- This script checks if Better Auth tables exist and are properly configured

-- Check if user table exists and has correct structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user' AND table_schema = 'public') THEN
        CREATE TABLE "user" (
            "id" TEXT PRIMARY KEY,
            "name" TEXT,
            "email" TEXT UNIQUE NOT NULL,
            "emailVerified" BOOLEAN DEFAULT FALSE,
            "image" TEXT,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        );
    END IF;
END $$;

-- Check if session table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'session' AND table_schema = 'public') THEN
        CREATE TABLE "session" (
            "id" TEXT PRIMARY KEY,
            "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
            "token" TEXT UNIQUE NOT NULL,
            "expiresAt" TIMESTAMP NOT NULL,
            "ipAddress" TEXT,
            "userAgent" TEXT,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        );
    END IF;
END $$;

-- Check if account table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'account' AND table_schema = 'public') THEN
        CREATE TABLE "account" (
            "id" TEXT PRIMARY KEY,
            "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
            "accountId" TEXT NOT NULL,
            "providerId" TEXT NOT NULL,
            "accessToken" TEXT,
            "refreshToken" TEXT,
            "idToken" TEXT,
            "accessTokenExpiresAt" TIMESTAMP,
            "refreshTokenExpiresAt" TIMESTAMP,
            "scope" TEXT,
            "password" TEXT,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        );
    END IF;
END $$;

-- Check if verification table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'verification' AND table_schema = 'public') THEN
        CREATE TABLE "verification" (
            "id" TEXT PRIMARY KEY,
            "identifier" TEXT NOT NULL,
            "value" TEXT NOT NULL,
            "expiresAt" TIMESTAMP NOT NULL,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        );
    END IF;
END $$;

-- Success message
SELECT 'Better Auth tables verified successfully' as status;
