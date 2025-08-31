import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(), // References Supabase auth.users.id
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const assetProjects = pgTable("asset_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(), // References Supabase auth.users.id
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const generatedAssets = pgTable("generated_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => assetProjects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(), // References Supabase auth.users.id
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"),
  parameters: jsonb("parameters"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const profileRelations = relations(profiles, ({ many }) => ({
  assetProjects: many(assetProjects),
  generatedAssets: many(generatedAssets),
}))

export const assetProjectRelations = relations(assetProjects, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [assetProjects.userId],
    references: [profiles.userId],
  }),
  generatedAssets: many(generatedAssets),
}))

export const generatedAssetRelations = relations(generatedAssets, ({ one }) => ({
  profile: one(profiles, {
    fields: [generatedAssets.userId],
    references: [profiles.userId],
  }),
  project: one(assetProjects, {
    fields: [generatedAssets.projectId],
    references: [assetProjects.id],
  }),
}))

const schema = {
  profiles,
  assetProjects,
  generatedAssets,
  profileRelations,
  assetProjectRelations,
  generatedAssetRelations,
}

const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || ""

if (!connectionString) {
  throw new Error("POSTGRES_URL environment variable is required for database connection")
}

const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "development",
})

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type AssetProject = typeof assetProjects.$inferSelect
export type NewAssetProject = typeof assetProjects.$inferInsert
export type GeneratedAsset = typeof generatedAssets.$inferSelect
export type NewGeneratedAsset = typeof generatedAssets.$inferInsert

export async function getUserProfile(userId: string) {
  const result = await db.query.profiles.findFirst({
    where: (profiles, { eq }) => eq(profiles.userId, userId),
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

export async function createUserProfile(userId: string, fullName?: string, avatarUrl?: string) {
  const result = await db
    .insert(profiles)
    .values({
      userId,
      fullName,
      avatarUrl,
    })
    .returning()
  return result[0]
}
