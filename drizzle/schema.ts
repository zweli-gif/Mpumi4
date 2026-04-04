import { integer, pgEnum, pgTable, text, timestamp, varchar, decimal, boolean, bigint, serial } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const energyLevelEnum = pgEnum("currentEnergyLevel", ["High", "Med", "Low"]);
export const moodEnum = pgEnum("mood", ["happy", "neutral", "sad"]);
export const energyEnum = pgEnum("energyLevel", ["High", "Med", "Low"]);
export const priorityStatusEnum = pgEnum("priority_status", ["pending", "in-progress", "done", "blocked"]);
export const celebrationCategoryEnum = pgEnum("celebration_category", ["deal", "birthday", "milestone", "project", "personal"]);
export const pipelineTypeEnum = pgEnum("pipeline_type", ["bd", "ventures", "studio", "clients", "finance", "admin"]);
export const distributionStrategyEnum = pgEnum("distribution_strategy", ["linear", "custom", "historical", "milestone"]);
export const performanceStatusEnum = pgEnum("performance_status", ["green", "amber", "red"]);
export const metricCategoryEnum = pgEnum("metric_category", ["revenue", "pipeline", "ventures", "clients", "finance", "team", "admin"]);
export const insightTypeEnum = pgEnum("insight_type", ["working", "challenge", "recommendation"]);
export const insightPriorityEnum = pgEnum("insight_priority", ["low", "medium", "high"]);
export const actionTypeEnum = pgEnum("action_type", ["card_moved", "card_created", "card_updated", "priority_added", "priority_completed", "health_checkin", "celebration_added", "goal_created", "goal_updated", "target_updated"]);
export const settingTypeEnum = pgEnum("setting_type", ["string", "number", "boolean", "json"]);
export const dueDayEnum = pgEnum("due_day", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
export const activityStatusEnum = pgEnum("activity_status", ["pending", "done", "delayed", "deprioritised"]);
export const partnerRoleEnum = pgEnum("partner_role", ["partner", "helper"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  jobTitle: varchar("jobTitle", { length: 128 }),
  birthplace: varchar("birthplace", { length: 255 }),
  lifePurpose: text("lifePurpose"),
  personalGoal: text("personalGoal"),
  skillMastering: text("skillMastering"),
  currentHealthScore: integer("currentHealthScore").default(75),
  currentEnergyLevel: energyLevelEnum("currentEnergyLevel").default("Med"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const healthCheckins = pgTable("healthCheckins", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  score: integer("score").notNull(),
  mood: moodEnum("mood").notNull(),
  energyLevel: energyEnum("energyLevel").notNull(),
  notes: text("notes"),
  checkinDate: timestamp("checkinDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthCheckin = typeof healthCheckins.$inferSelect;
export type InsertHealthCheckin = typeof healthCheckins.$inferInsert;

export const weeklyPriorities = pgTable("weeklyPriorities", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  description: text("description").notNull(),
  status: priorityStatusEnum("status").default("pending").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  weekNumber: integer("weekNumber").notNull(),
  year: integer("year").notNull(),
  linkedGoalId: integer("linkedGoalId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type WeeklyPriority = typeof weeklyPriorities.$inferSelect;
export type InsertWeeklyPriority = typeof weeklyPriorities.$inferInsert;

export const celebrations = pgTable("celebrations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: celebrationCategoryEnum("category").notNull(),
  icon: varchar("icon", { length: 10 }).default("🎉"),
  celebrationDate: timestamp("celebrationDate").notNull(),
  createdBy: integer("createdBy").notNull(),
  taggedUsers: text("taggedUsers"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Celebration = typeof celebrations.$inferSelect;
export type InsertCelebration = typeof celebrations.$inferInsert;

export type CelebrationWithUser = Celebration & {
  createdByName: string | null;
  createdByAvatar: string | null;
};

export const pipelineStages = pgTable("pipelineStages", {
  id: serial("id").primaryKey(),
  pipelineType: pipelineTypeEnum("pipelineType").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  order: integer("order").notNull(),
  probabilityWeight: integer("probabilityWeight").default(0),
  color: varchar("color", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PipelineStage = typeof pipelineStages.$inferSelect;
export type InsertPipelineStage = typeof pipelineStages.$inferInsert;

export const pipelineCards = pgTable("pipelineCards", {
  id: serial("id").primaryKey(),
  stageId: integer("stageId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  value: decimal("value", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("ZAR"),
  ownerId: integer("ownerId"),
  dueDate: timestamp("dueDate"),
  tags: text("tags"),
  metadata: text("metadata"),
  position: integer("position").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  movedAt: timestamp("movedAt"),
});

export type PipelineCard = typeof pipelineCards.$inferSelect;
export type InsertPipelineCard = typeof pipelineCards.$inferInsert;

export const annualGoals = pgTable("annualGoals", {
  id: serial("id").primaryKey(),
  strategicObjective: varchar("strategicObjective", { length: 100 }).notNull(),
  goalName: varchar("goalName", { length: 255 }).notNull(),
  targetValue: decimal("targetValue", { precision: 15, scale: 2 }).notNull(),
  targetUnit: varchar("targetUnit", { length: 50 }).notNull(),
  ownerId: integer("ownerId"),
  ownerName: varchar("ownerName", { length: 255 }),
  year: integer("year").notNull(),
  distributionStrategy: distributionStrategyEnum("distributionStrategy").default("linear").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AnnualGoal = typeof annualGoals.$inferSelect;
export type InsertAnnualGoal = typeof annualGoals.$inferInsert;

export const monthlyTargets = pgTable("monthlyTargets", {
  id: serial("id").primaryKey(),
  goalId: integer("goalId").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  targetValue: decimal("targetValue", { precision: 15, scale: 2 }).notNull(),
  actualValue: decimal("actualValue", { precision: 15, scale: 2 }).default("0"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  rationale: text("rationale"),
  notes: text("notes"),
  isLocked: boolean("isLocked").default(false),
  performanceStatus: performanceStatusEnum("performanceStatus"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MonthlyTarget = typeof monthlyTargets.$inferSelect;
export type InsertMonthlyTarget = typeof monthlyTargets.$inferInsert;

export const performanceSnapshots = pgTable("performanceSnapshots", {
  id: serial("id").primaryKey(),
  metricName: varchar("metricName", { length: 100 }).notNull(),
  metricCategory: metricCategoryEnum("metricCategory").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  snapshotDate: timestamp("snapshotDate").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PerformanceSnapshot = typeof performanceSnapshots.$inferSelect;
export type InsertPerformanceSnapshot = typeof performanceSnapshots.$inferInsert;

export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  metricName: varchar("metricName", { length: 100 }).notNull(),
  insightType: insightTypeEnum("insightType").notNull(),
  content: text("content").notNull(),
  priority: insightPriorityEnum("priority").default("medium"),
  generatedAt: timestamp("generatedAt").notNull(),
  validUntil: timestamp("validUntil"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = typeof insights.$inferInsert;

export const activityLog = pgTable("activityLog", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  actionType: actionTypeEnum("actionType").notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: integer("entityId").notNull(),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  description: text("description"),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

export const dashboardMetrics = pgTable("dashboardMetrics", {
  id: serial("id").primaryKey(),
  metricKey: varchar("metricKey", { length: 100 }).notNull().unique(),
  metricValue: text("metricValue").notNull(),
  lastCalculated: timestamp("lastCalculated").notNull(),
  expiresAt: timestamp("expiresAt"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DashboardMetric = typeof dashboardMetrics.$inferSelect;
export type InsertDashboardMetric = typeof dashboardMetrics.$inferInsert;

export const systemSettings = pgTable("systemSettings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  settingType: settingTypeEnum("settingType").default("string").notNull(),
  description: text("description"),
  updatedBy: integer("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

export const ceoReflections = pgTable("ceoReflections", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  weekNumber: integer("weekNumber").notNull(),
  year: integer("year").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CeoReflection = typeof ceoReflections.$inferSelect;
export type InsertCeoReflection = typeof ceoReflections.$inferInsert;

export const weeklyActivities = pgTable("weeklyActivities", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  activity: text("activity").notNull(),
  dueDay: dueDayEnum("dueDay").notNull(),
  dependency: text("dependency"),
  accountabilityPartnerId: integer("accountabilityPartnerId"),
  partnerRole: partnerRoleEnum("partnerRole"),
  monthlyGoalId: integer("monthlyGoalId"),
  status: activityStatusEnum("status").default("pending").notNull(),
  isPriority: boolean("isPriority").default(false),
  weekNumber: integer("weekNumber").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type WeeklyActivity = typeof weeklyActivities.$inferSelect;
export type InsertWeeklyActivity = typeof weeklyActivities.$inferInsert;

export const strategicObjectives = pgTable("strategicObjectives", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  weight: integer("weight").notNull().default(20),
  icon: varchar("icon", { length: 50 }).default("Target"),
  color: varchar("color", { length: 50 }).default("text-blue-600"),
  bgColor: varchar("bgColor", { length: 100 }).default("bg-blue-50 border-blue-200"),
  displayOrder: integer("displayOrder").notNull().default(0),
  year: integer("year").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StrategicObjective = typeof strategicObjectives.$inferSelect;
export type InsertStrategicObjective = typeof strategicObjectives.$inferInsert;