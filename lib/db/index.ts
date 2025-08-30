import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || ""

if (!connectionString) {
  throw new Error(
    "Database connection string not found. Please set POSTGRES_URL, POSTGRES_PRISMA_URL, or DATABASE_URL environment variable.",
  )
}

// Create postgres client with connection pooling for serverless
const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
})

// Create Drizzle database instance with schema
export const db = drizzle(client, { schema })

// Export schema for use in queries
export * from "./schema"
