import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || ""

if (!connectionString) {
  throw new Error(
    "Database connection string not found. Please set POSTGRES_URL, POSTGRES_PRISMA_URL, or DATABASE_URL environment variable.",
  )
}

// Create postgres client with optimized settings for serverless
const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Create Drizzle database instance with schema
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "development",
})

// Export schema for use in queries
export * from "./schema"

export async function getUserById(id: string) {
  const result = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, id),
  })
  return result
}

export async function getUserProjects(userId: string) {
  const result = await db.query.assetProjects.findMany({
    where: (projects, { eq }) => eq(projects.userId, userId),
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
  })
  return result
}

export async function getUserAssets(userId: string) {
  const result = await db.query.generatedAssets.findMany({
    where: (assets, { eq }) => eq(assets.userId, userId),
    with: {
      project: true,
    },
    orderBy: (assets, { desc }) => [desc(assets.createdAt)],
  })
  return result
}
