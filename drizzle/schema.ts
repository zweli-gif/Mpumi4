import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with health tracking fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  jobTitle: varchar("jobTitle", { length: 128 }),
  // Extended profile fields
  birthplace: varchar("birthplace", { length: 255 }),
  lifePurpose: text("lifePurpose"),
  personalGoal: text("personalGoal"),
  skillMastering: text("skillMastering"),
  currentHealthScore: int("currentHealthScore").default(75),
  currentEnergyLevel: mysqlEnum("currentEnergyLevel", ["High", "Med", "Low"]).default("Med"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Team health check-ins - historical tracking
 */
export const healthCheckins = mysqlTable("healthCheckins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  score: int("score").notNull(), // 0-100
  mood: mysqlEnum("mood", ["happy", "neutral", "sad"]).notNull(),
  energyLevel: mysqlEnum("energyLevel", ["High", "Med", "Low"]).notNull(),
  notes: text("notes"),
  checkinDate: timestamp("checkinDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthCheckin = typeof healthCheckins.$inferSelect;
export type InsertHealthCheckin = typeof healthCheckins.$inferInsert;

/**
 * Weekly priorities - max 5 per person per week
 */
export const weeklyPriorities = mysqlTable("weeklyPriorities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["pending", "in-progress", "done", "blocked"]).default("pending").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  weekNumber: int("weekNumber").notNull(), // ISO week number
  year: int("year").notNull(),
  linkedGoalId: int("linkedGoalId"), // Optional link to annual goal
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeeklyPriority = typeof weeklyPriorities.$inferSelect;
export type InsertWeeklyPriority = typeof weeklyPriorities.$inferInsert;

/**
 * Celebrations feed - team wins and milestones
 */
export const celebrations = mysqlTable("celebrations", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["deal", "birthday", "milestone", "project", "personal"]).notNull(),
  icon: varchar("icon", { length: 10 }).default("🎉"),
  celebrationDate: timestamp("celebrationDate").notNull(),
  createdBy: int("createdBy").notNull(),
  taggedUsers: text("taggedUsers"), // JSON array of user IDs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Celebration = typeof celebrations.$inferSelect;
export type InsertCelebration = typeof celebrations.$inferInsert;

// Extended type for celebrations with user join
export type CelebrationWithUser = Celebration & {
  createdByName: string | null;
  createdByAvatar: string | null;
};

/**
 * Pipeline stages configuration for all 6 categories
 */
export const pipelineStages = mysqlTable("pipelineStages", {
  id: int("id").autoincrement().primaryKey(),
  pipelineType: mysqlEnum("pipelineType", ["bd", "ventures", "studio", "clients", "finance", "admin"]).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  order: int("order").notNull(),
  probabilityWeight: int("probabilityWeight").default(0), // For weighted pipeline calculations (0-100)
  color: varchar("color", { length: 20 }), // For visual differentiation
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PipelineStage = typeof pipelineStages.$inferSelect;
export type InsertPipelineStage = typeof pipelineStages.$inferInsert;

/**
 * Pipeline cards - items in Kanban boards
 */
export const pipelineCards = mysqlTable("pipelineCards", {
  id: int("id").autoincrement().primaryKey(),
  stageId: int("stageId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  value: decimal("value", { precision: 15, scale: 2 }), // Monetary value
  currency: varchar("currency", { length: 3 }).default("ZAR"),
  ownerId: int("ownerId"),
  dueDate: timestamp("dueDate"),
  tags: text("tags"), // JSON array of tags
  metadata: text("metadata"), // JSON for flexible additional data
  position: int("position").default(0), // For ordering within stage
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  movedAt: timestamp("movedAt"), // Last time card moved stages
});

export type PipelineCard = typeof pipelineCards.$inferSelect;
export type InsertPipelineCard = typeof pipelineCards.$inferInsert;

/**
 * Annual goals - strategic objectives for the year
 */
export const annualGoals = mysqlTable("annualGoals", {
  id: int("id").autoincrement().primaryKey(),
  strategicObjective: varchar("strategicObjective", { length: 100 }).notNull(), // e.g., "Community Growth", "Impact Delivery"
  goalName: varchar("goalName", { length: 255 }).notNull(),
  targetValue: decimal("targetValue", { precision: 15, scale: 2 }).notNull(),
  targetUnit: varchar("targetUnit", { length: 50 }).notNull(), // e.g., "%", "R", "#", "days"
  ownerId: int("ownerId"),
  ownerName: varchar("ownerName", { length: 255 }), // EXCO Owner name
  year: int("year").notNull(),
  distributionStrategy: mysqlEnum("distributionStrategy", ["linear", "custom", "historical", "milestone"]).default("linear").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnnualGoal = typeof annualGoals.$inferSelect;
export type InsertAnnualGoal = typeof annualGoals.$inferInsert;

/**
 * Monthly targets - cascaded from annual goals
 */
export const monthlyTargets = mysqlTable("monthlyTargets", {
  id: int("id").autoincrement().primaryKey(),
  goalId: int("goalId").notNull(),
  month: int("month").notNull(), // 1-12
  year: int("year").notNull(),
  targetValue: decimal("targetValue", { precision: 15, scale: 2 }).notNull(),
  actualValue: decimal("actualValue", { precision: 15, scale: 2 }).default("0"),
  weight: decimal("weight", { precision: 5, scale: 2 }), // Percentage weight for custom distribution
  rationale: text("rationale"), // Explanation for the target
  notes: text("notes"),
  isLocked: boolean("isLocked").default(false), // Locked after 5th of following month
  performanceStatus: mysqlEnum("performanceStatus", ["green", "amber", "red"]), // green ≥75%, amber 60-74%, red <60%
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MonthlyTarget = typeof monthlyTargets.$inferSelect;
export type InsertMonthlyTarget = typeof monthlyTargets.$inferInsert;

/**
 * Performance snapshots - for trend analysis
 */
export const performanceSnapshots = mysqlTable("performanceSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  metricName: varchar("metricName", { length: 100 }).notNull(),
  metricCategory: mysqlEnum("metricCategory", ["revenue", "pipeline", "ventures", "clients", "finance", "team", "admin"]).notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  snapshotDate: timestamp("snapshotDate").notNull(),
  metadata: text("metadata"), // JSON for additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PerformanceSnapshot = typeof performanceSnapshots.$inferSelect;
export type InsertPerformanceSnapshot = typeof performanceSnapshots.$inferInsert;

/**
 * Automated insights - generated analysis for trends
 */
export const insights = mysqlTable("insights", {
  id: int("id").autoincrement().primaryKey(),
  metricName: varchar("metricName", { length: 100 }).notNull(),
  insightType: mysqlEnum("insightType", ["working", "challenge", "recommendation"]).notNull(),
  content: text("content").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  generatedAt: timestamp("generatedAt").notNull(),
  validUntil: timestamp("validUntil"), // Optional expiry for time-sensitive insights
  metadata: text("metadata"), // JSON for supporting data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = typeof insights.$inferInsert;

/**
 * Activity log - real-time tracking of all actions
 */
export const activityLog = mysqlTable("activityLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  actionType: mysqlEnum("actionType", [
    "card_moved", 
    "card_created", 
    "card_updated", 
    "priority_added", 
    "priority_completed", 
    "health_checkin", 
    "celebration_added",
    "goal_created",
    "goal_updated",
    "target_updated"
  ]).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(), // e.g., "pipeline_card", "weekly_priority"
  entityId: int("entityId").notNull(),
  oldValue: text("oldValue"), // JSON snapshot of previous state
  newValue: text("newValue"), // JSON snapshot of new state
  description: text("description"), // Human-readable description
  timestamp: bigint("timestamp", { mode: "number" }).notNull(), // Unix timestamp in milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

/**
 * Dashboard metrics cache - for quick snapshot display
 */
export const dashboardMetrics = mysqlTable("dashboardMetrics", {
  id: int("id").autoincrement().primaryKey(),
  metricKey: varchar("metricKey", { length: 100 }).notNull().unique(),
  metricValue: text("metricValue").notNull(), // JSON for flexible structure
  lastCalculated: timestamp("lastCalculated").notNull(),
  expiresAt: timestamp("expiresAt"), // Optional TTL for cache invalidation
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DashboardMetric = typeof dashboardMetrics.$inferSelect;
export type InsertDashboardMetric = typeof dashboardMetrics.$inferInsert;

/**
 * System settings - configuration for the application
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  settingType: mysqlEnum("settingType", ["string", "number", "boolean", "json"]).default("string").notNull(),
  description: text("description"),
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;


/**
 * CEO Weekly Reflections - Top of mind from CEO this week
 */
export const ceoReflections = mysqlTable("ceoReflections", {
  id: int("id").autoincrement().primaryKey(),
  content: text("content").notNull(), // Max ~10 lines of text
  weekNumber: int("weekNumber").notNull(), // ISO week number
  year: int("year").notNull(),
  createdBy: int("createdBy").notNull(), // CEO user ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CeoReflection = typeof ceoReflections.$inferSelect;
export type InsertCeoReflection = typeof ceoReflections.$inferInsert;


/**
 * Weekly Activities - Excel-like tracker for weekly tasks
 */
export const weeklyActivities = mysqlTable("weeklyActivities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Who owns this activity
  activity: text("activity").notNull(), // Activity description
  dueDay: mysqlEnum("dueDay", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]).notNull(),
  dependency: text("dependency"), // What this depends on
  accountabilityPartnerId: int("accountabilityPartnerId"), // User ID of accountability partner
  partnerRole: mysqlEnum("partnerRole", ["partner", "helper"]), // Role when assigned to partner (null if not assigned)
  monthlyGoalId: int("monthlyGoalId"), // Link to monthly target (optional)
  status: mysqlEnum("status", ["pending", "done", "delayed", "deprioritised"]).default("pending").notNull(),
  isPriority: boolean("isPriority").default(false), // Top 3 priorities per user per week
  weekNumber: int("weekNumber").notNull(), // ISO week number
  year: int("year").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeeklyActivity = typeof weeklyActivities.$inferSelect;
export type InsertWeeklyActivity = typeof weeklyActivities.$inferInsert;

/**
 * Strategic Objectives - configurable objectives with weights
 */
export const strategicObjectives = mysqlTable("strategicObjectives", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  weight: int("weight").notNull().default(20), // Percentage weight (0-100)
  icon: varchar("icon", { length: 50 }).default("Target"), // Icon name
  color: varchar("color", { length: 50 }).default("text-blue-600"), // Tailwind color class
  bgColor: varchar("bgColor", { length: 100 }).default("bg-blue-50 border-blue-200"), // Background color class
  displayOrder: int("displayOrder").notNull().default(0),
  year: int("year").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StrategicObjective = typeof strategicObjectives.$inferSelect;
export type InsertStrategicObjective = typeof strategicObjectives.$inferInsert;
