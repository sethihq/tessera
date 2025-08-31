# AI game asset creator

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/sethihq/v0-ai-game-asset-creator)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/A9IXp9v1eEG)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/sethihq/v0-ai-game-asset-creator](https://vercel.com/sethihq/v0-ai-game-asset-creator)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/A9IXp9v1eEG](https://v0.app/chat/projects/A9IXp9v1eEG)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Environment Setup

1. Copy \.env.example\ to \.env\
2. Fill in your actual environment variables
3. Run \pnpm install\ to install dependencies
4. Run \
px drizzle-kit push\ to set up the database schema
5. Run \pnpm dev\ to start the development server

## Required Environment Variables

- Database credentials (PostgreSQL via Supabase)
- Supabase project configuration
- Gemini API key for AI features
- Better Auth configuration for authentication
