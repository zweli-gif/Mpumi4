import { eq, desc, and, asc, gte, lte, sql, inArray, or, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { 
  InsertUser, 
  users,
  healthCheckins,
  InsertHealthCheckin,
  weeklyPriorities,
  InsertWeeklyPriority,
  celebrations,
  InsertCelebration,
  pipelineStages,
  InsertPipelineStage,
  pipelineCards,
  InsertPipelineCard,
  annualGoals,
  InsertAnnualGoal,
  monthlyTargets,
  InsertMonthlyTarget,
  performanceSnapshots,
  InsertPerformanceSnapshot,
  insights,
  InsertInsight,
  activityLog,
  InsertActivityLog,
  dashboardMetrics,
  InsertDashboardMetric,
  systemSettings,
  InsertSystemSetting,
  weeklyActivities,
  InsertWeeklyActivity,
  strategicObjectives,
  InsertStrategicObjective,
  ceoReflections,
  InsertCeoReflection,
  CelebrationWithUser
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "avatarUrl"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(asc(users.name));
}

export async function updateUser(userId: number, data: { 
  name?: string; 
  email?: string; 
  role?: "user" | "admin"; 
  jobTitle?: string;
  birthplace?: string;
  lifePurpose?: string;
  personalGoal?: string;
  skillMastering?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.update(users).set(data).where(eq(users.id, userId));
  const [updated] = await db.select().from(users).where(eq(users.id, userId));
  return updated || null;
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(users).where(eq(users.id, userId));
  return true;
}

export async function updateUserOpenId(userId: number, newOpenId: string) {
  const db = await getDb();
  if (!db) return false;
  await db.update(users).set({ openId: newOpenId }).where(eq(users.id, userId));
  return true;
}

export async function createInvitedUser(data: { name: string; email: string; role?: "user" | "admin"; jobTitle?: string }) {
  const db = await getDb();
  if (!db) return null;
  const openId = `invited_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const result = await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    role: data.role || "user",
    jobTitle: data.jobTitle,
    loginMethod: "invited",
  }).returning();
  return result[0] || null;
}

export async function updateUserHealth(userId: number, healthScore: number, energyLevel: "High" | "Med" | "Low") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ currentHealthScore: healthScore, currentEnergyLevel: energyLevel }).where(eq(users.id, userId));
}

export async function createHealthCheckin(checkin: InsertHealthCheckin) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(healthCheckins).values(checkin);
  await updateUserHealth(checkin.userId, checkin.score, checkin.energyLevel);
  return result;
}

export async function getRecentHealthCheckins(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(healthCheckins).where(eq(healthCheckins.userId, userId)).orderBy(desc(healthCheckins.checkinDate)).limit(limit);
}

export async function getTeamHealthOverview() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    userId: users.id,
    name: users.name,
    email: users.email,
    avatarUrl: users.avatarUrl,
    jobTitle: users.jobTitle,
    currentHealthScore: users.currentHealthScore,
    currentEnergyLevel: users.currentEnergyLevel,
  }).from(users).where(isNotNull(users.currentHealthScore));
}

export async function createWeeklyPriority(priority: InsertWeeklyPriority) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(weeklyPriorities).values(priority);
}

export async function getWeeklyPriorities(weekNumber: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weeklyPriorities).where(and(eq(weeklyPriorities.weekNumber, weekNumber), eq(weeklyPriorities.year, year))).orderBy(asc(weeklyPriorities.dueDate));
}

export async function getUserWeeklyPriorities(userId: number, weekNumber: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weeklyPriorities).where(and(eq(weeklyPriorities.userId, userId), eq(weeklyPriorities.weekNumber, weekNumber), eq(weeklyPriorities.year, year))).orderBy(asc(weeklyPriorities.dueDate));
}

export async function updateWeeklyPriority(id: number, updates: Partial<InsertWeeklyPriority>) {
  const db = await getDb();
  if (!db) return null;
  return db.update(weeklyPriorities).set(updates).where(eq(weeklyPriorities.id, id));
}

export async function deleteWeeklyPriority(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(weeklyPriorities).where(eq(weeklyPriorities.id, id));
}

export async function createCelebration(celebration: InsertCelebration) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(celebrations).values(celebration);
}

export async function getRecentCelebrations(limit: number = 20): Promise<CelebrationWithUser[]> {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select({
    id: celebrations.id,
    title: celebrations.title,
    description: celebrations.description,
    category: celebrations.category,
    icon: celebrations.icon,
    celebrationDate: celebrations.celebrationDate,
    createdBy: celebrations.createdBy,
    taggedUsers: celebrations.taggedUsers,
    createdAt: celebrations.createdAt,
    createdByName: users.name,
    createdByAvatar: users.avatarUrl,
  }).from(celebrations).leftJoin(users, eq(celebrations.createdBy, users.id)).orderBy(desc(celebrations.celebrationDate)).limit(limit);
  return results;
}

export async function deleteCelebration(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(celebrations).where(eq(celebrations.id, id));
}

export async function getPipelineStages(pipelineType: "bd" | "ventures" | "studio" | "clients" | "finance" | "admin") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pipelineStages).where(eq(pipelineStages.pipelineType, pipelineType)).orderBy(asc(pipelineStages.order));
}

export async function createPipelineStage(stage: InsertPipelineStage) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(pipelineStages).values(stage);
}

export async function getPipelineCards(stageId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pipelineCards).where(eq(pipelineCards.stageId, stageId)).orderBy(asc(pipelineCards.position));
}

export async function getPipelineCard(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.select().from(pipelineCards).where(eq(pipelineCards.id, id)).then(rows => rows[0] || null);
}

export async function getPipelineCardsByType(pipelineType: "bd" | "ventures" | "studio" | "clients" | "finance" | "admin") {
  const db = await getDb();
  if (!db) return [];
  const stages = await getPipelineStages(pipelineType);
  const stageIds = stages.map(s => s.id);
  if (stageIds.length === 0) return [];
  return db.select().from(pipelineCards).where(inArray(pipelineCards.stageId, stageIds)).orderBy(asc(pipelineCards.position));
}

export async function createPipelineCard(card: InsertPipelineCard) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(pipelineCards).values(card);
}

export async function updatePipelineCard(id: number, updates: Partial<InsertPipelineCard>) {
  const db = await getDb();
  if (!db) return null;
  return db.update(pipelineCards).set(updates).where(eq(pipelineCards.id, id));
}

export async function movePipelineCard(cardId: number, newStageId: number) {
  const db = await getDb();
  if (!db) return null;
  return db.update(pipelineCards).set({ stageId: newStageId, movedAt: new Date() }).where(eq(pipelineCards.id, cardId));
}

export async function deletePipelineCard(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(pipelineCards).where(eq(pipelineCards.id, id));
}

export async function createAnnualGoal(goal: InsertAnnualGoal) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(annualGoals).values(goal);
}

export async function getAnnualGoals(year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(annualGoals).where(eq(annualGoals.year, year)).orderBy(asc(annualGoals.strategicObjective));
}

export async function updateAnnualGoal(id: number, updates: Partial<InsertAnnualGoal>) {
  const db = await getDb();
  if (!db) return null;
  return db.update(annualGoals).set(updates).where(eq(annualGoals.id, id));
}

export async function deleteAnnualGoal(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(annualGoals).where(eq(annualGoals.id, id));
}

export async function createMonthlyTarget(target: InsertMonthlyTarget) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(monthlyTargets).values(target);
}

export async function getMonthlyTargets(goalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(monthlyTargets).where(eq(monthlyTargets.goalId, goalId)).orderBy(asc(monthlyTargets.month));
}

export async function getMonthlyTargetsByMonth(month: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(monthlyTargets).where(and(eq(monthlyTargets.month, month), eq(monthlyTargets.year, year)));
}

export async function updateMonthlyTarget(id: number, updates: Partial<InsertMonthlyTarget>) {
  const db = await getDb();
  if (!db) return null;
  return db.update(monthlyTargets).set(updates).where(eq(monthlyTargets.id, id));
}

export async function updateMonthlyTargetByGoalMonth(goalId: number, month: number, year: number, updates: Partial<InsertMonthlyTarget>) {
  const db = await getDb();
  if (!db) return null;
  return db.update(monthlyTargets).set(updates).where(and(eq(monthlyTargets.goalId, goalId), eq(monthlyTargets.month, month), eq(monthlyTargets.year, year)));
}

export async function bulkCreateMonthlyTargets(targets: InsertMonthlyTarget[]) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(monthlyTargets).values(targets);
}

export async function getAllMonthlyTargetsForYear(year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(monthlyTargets).innerJoin(annualGoals, eq(monthlyTargets.goalId, annualGoals.id)).where(eq(monthlyTargets.year, year)).orderBy(asc(annualGoals.strategicObjective), asc(monthlyTargets.month));
}

export async function createPerformanceSnapshot(snapshot: InsertPerformanceSnapshot) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(performanceSnapshots).values(snapshot);
}

export async function getPerformanceSnapshots(metricName: string, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(performanceSnapshots).where(and(eq(performanceSnapshots.metricName, metricName), gte(performanceSnapshots.snapshotDate, startDate), lte(performanceSnapshots.snapshotDate, endDate))).orderBy(asc(performanceSnapshots.snapshotDate));
}

export async function createInsight(insight: InsertInsight) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(insights).values(insight);
}

export async function getActiveInsights(metricName?: string) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const query = db.select().from(insights);
  if (metricName) {
    return query.where(and(eq(insights.metricName, metricName), sql`(${insights.validUntil} IS NULL OR ${insights.validUntil} > ${now})`)).orderBy(desc(insights.priority), desc(insights.generatedAt));
  }
  return query.where(sql`(${insights.validUntil} IS NULL OR ${insights.validUntil} > ${now})`).orderBy(desc(insights.priority), desc(insights.generatedAt));
}

export async function logActivity(activity: InsertActivityLog) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(activityLog).values(activity);
}

export async function getRecentActivity(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLog).orderBy(desc(activityLog.timestamp)).limit(limit);
}

export async function getActivityByEntity(entityType: string, entityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLog).where(and(eq(activityLog.entityType, entityType), eq(activityLog.entityId, entityId))).orderBy(desc(activityLog.timestamp));
}

export async function getCachedMetric(metricKey: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(dashboardMetrics).where(eq(dashboardMetrics.metricKey, metricKey)).limit(1);
  if (result.length === 0) return null;
  const metric = result[0];
  if (metric.expiresAt && new Date() > metric.expiresAt) return null;
  return metric;
}

export async function setCachedMetric(metric: InsertDashboardMetric) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(dashboardMetrics).values(metric).onConflictDoUpdate({
    target: dashboardMetrics.metricKey,
    set: { metricValue: metric.metricValue, lastCalculated: metric.lastCalculated, expiresAt: metric.expiresAt },
  });
}

export async function getSetting(settingKey: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, settingKey)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function setSetting(setting: InsertSystemSetting) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(systemSettings).values(setting).onConflictDoUpdate({
    target: systemSettings.settingKey,
    set: { settingValue: setting.settingValue, settingType: setting.settingType, description: setting.description, updatedBy: setting.updatedBy },
  });
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(systemSettings).orderBy(asc(systemSettings.settingKey));
}

export async function createWeeklyActivity(activity: InsertWeeklyActivity) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(weeklyActivities).values(activity);
}

export async function getWeeklyActivities(userId: number, weekNumber: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weeklyActivities).where(and(eq(weeklyActivities.userId, userId), eq(weeklyActivities.weekNumber, weekNumber), eq(weeklyActivities.year, year))).orderBy(asc(weeklyActivities.dueDay));
}

export async function getAllWeeklyActivities(weekNumber: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weeklyActivities).innerJoin(users, eq(weeklyActivities.userId, users.id)).where(and(eq(weeklyActivities.weekNumber, weekNumber), eq(weeklyActivities.year, year))).orderBy(asc(users.name), asc(weeklyActivities.dueDay));
}

export async function updateWeeklyActivity(id: number, updates: Partial<InsertWeeklyActivity>) {
  const db = await getDb();
  if (!db) return null;
  return db.update(weeklyActivities).set(updates).where(eq(weeklyActivities.id, id));
}

export async function deleteWeeklyActivity(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(weeklyActivities).where(eq(weeklyActivities.id, id));
}

export async function getAssignedActivities(userId: number, weekNumber: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weeklyActivities).innerJoin(users, eq(weeklyActivities.userId, users.id)).where(and(eq(weeklyActivities.accountabilityPartnerId, userId), eq(weeklyActivities.weekNumber, weekNumber), eq(weeklyActivities.year, year), isNotNull(weeklyActivities.partnerRole))).orderBy(asc(weeklyActivities.dueDay));
}

export async function getActivityById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(weeklyActivities).innerJoin(users, eq(weeklyActivities.userId, users.id)).where(eq(weeklyActivities.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
export async function getDashboardWeeklyOverview(weekNumber: number, year: number) {
  const db = await getDb();
  if (!db) return { activities: [], statusSummary: { pending: 0, done: 0, delayed: 0, deprioritised: 0 }, priorityActivities: [], dueDayDistribution: {}, totalActivities: 0 };

  const allActivities = await db.select().from(weeklyActivities).innerJoin(users, eq(weeklyActivities.userId, users.id)).where(and(eq(weeklyActivities.weekNumber, weekNumber), eq(weeklyActivities.year, year))).orderBy(asc(users.name), asc(weeklyActivities.dueDay));

  const statusSummary = { pending: 0, done: 0, delayed: 0, deprioritised: 0 };
  const dueDayDistribution: Record<string, number> = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
  const priorityActivities: typeof allActivities = [];

  allActivities.forEach(item => {
    const activity = item.weeklyActivities;
    if (activity.status === 'pending') statusSummary.pending++;
    else if (activity.status === 'done') statusSummary.done++;
    else if (activity.status === 'delayed') statusSummary.delayed++;
    else if (activity.status === 'deprioritised') statusSummary.deprioritised++;
    dueDayDistribution[activity.dueDay]++;
    if (activity.isPriority && activity.status !== 'done' && activity.status !== 'deprioritised') priorityActivities.push(item);
  });

  return { activities: allActivities, statusSummary, priorityActivities, dueDayDistribution, totalActivities: allActivities.length };
}

export async function getStrategicObjectives(year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(strategicObjectives).where(eq(strategicObjectives.year, year)).orderBy(asc(strategicObjectives.displayOrder));
}

export async function createStrategicObjective(objective: InsertStrategicObjective) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(strategicObjectives).values(objective);
}

export async function updateStrategicObjective(id: number, updates: Partial<InsertStrategicObjective>) {
  const db = await getDb();
  if (!db) return null;
  return db.update(strategicObjectives).set(updates).where(eq(strategicObjectives.id, id));
}

export async function deleteStrategicObjective(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(strategicObjectives).where(eq(strategicObjectives.id, id));
}

export async function initializeDefaultObjectives(year: number) {
  const db = await getDb();
  if (!db) return null;
  const existing = await getStrategicObjectives(year);
  if (existing.length > 0) return existing;
  const defaults = [
    { name: "Community Growth", weight: 20, icon: "Users", color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200", displayOrder: 1, year },
    { name: "Impact Delivery", weight: 25, icon: "Target", color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200", displayOrder: 2, year },
    { name: "New Frontiers", weight: 20, icon: "Rocket", color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200", displayOrder: 3, year },
    { name: "Stewardship", weight: 20, icon: "Shield", color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200", displayOrder: 4, year },
    { name: "Purpose & Platform", weight: 15, icon: "Compass", color: "text-rose-600", bgColor: "bg-rose-50 border-rose-200", displayOrder: 5, year },
  ];
  await db.insert(strategicObjectives).values(defaults);
  return getStrategicObjectives(year);
}

export async function getKPIStatusWithActivities(year: number) {
  const db = await getDb();
  if (!db) return [];
  const goals = await db.select().from(annualGoals).where(eq(annualGoals.year, year)).orderBy(asc(annualGoals.strategicObjective), asc(annualGoals.id));
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  const goalsWithStatus = await Promise.all(goals.map(async (goal) => {
    const recentActivities = await db.select().from(weeklyActivities).where(and(eq(weeklyActivities.monthlyGoalId, goal.id), gte(weeklyActivities.createdAt, fourWeeksAgo))) || [];
    let status: 'ok' | 'check' | 'save' = 'save';
    if (recentActivities.length > 0) {
      const hasRecentActivity = recentActivities.some(a => a.createdAt.getTime() >= twoWeeksAgo.getTime());
      status = hasRecentActivity ? 'ok' : 'check';
    }
    return { ...goal, status, activityCount: recentActivities.length };
  }));
  return goalsWithStatus;
}

export async function getCeoReflectionForWeek(weekNumber: number, year: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(ceoReflections).where(and(eq(ceoReflections.weekNumber, weekNumber), eq(ceoReflections.year, year))).limit(1);
  return results[0] || null;
}

export async function createCeoReflection(reflection: InsertCeoReflection) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(ceoReflections).values(reflection);
}

export async function updateCeoReflection(id: number, content: string) {
  const db = await getDb();
  if (!db) return null;
  return db.update(ceoReflections).set({ content, updatedAt: new Date() }).where(eq(ceoReflections.id, id));
}

export async function getRecentCeoReflections(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ceoReflections).orderBy(desc(ceoReflections.year), desc(ceoReflections.weekNumber)).limit(limit);
}