import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { pgTable, text, timestamp, uuid, jsonb, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const assetProjects = pgTable("asset_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const generatedAssets = pgTable("generated_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => assetProjects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"),
  parameters: jsonb("parameters"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  profiles: many(profiles),
  assetProjects: many(assetProjects),
  generatedAssets: many(generatedAssets),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const profileRelations = relations(profiles, ({ one }) => ({
  user: one(user, {
    fields: [profiles.userId],
    references: [user.id],
  }),
}))

export const assetProjectRelations = relations(assetProjects, ({ one, many }) => ({
  user: one(user, {
    fields: [assetProjects.userId],
    references: [user.id],
  }),
  generatedAssets: many(generatedAssets),
}))

export const generatedAssetRelations = relations(generatedAssets, ({ one }) => ({
  user: one(user, {
    fields: [generatedAssets.userId],
    references: [user.id],
  }),
  project: one(assetProjects, {
    fields: [generatedAssets.projectId],
    references: [assetProjects.id],
  }),
}))

const schema = {
  user,
  session,
  account,
  verification,
  profiles,
  assetProjects,
  generatedAssets,
  userRelations,
  sessionRelations,
  accountRelations,
  profileRelations,
  assetProjectRelations,
  generatedAssetRelations,
}

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

export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert
export type Session = typeof session.$inferSelect
export type NewSession = typeof session.$inferInsert
export type Account = typeof account.$inferSelect
export type NewAccount = typeof account.$inferInsert
export type Verification = typeof verification.$inferSelect
export type NewVerification = typeof verification.$inferInsert
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type AssetProject = typeof assetProjects.$inferSelect
export type NewAssetProject = typeof assetProjects.$inferInsert
export type GeneratedAsset = typeof generatedAssets.$inferSelect
export type NewGeneratedAsset = typeof generatedAssets.$inferInsert

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
