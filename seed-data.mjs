import { drizzle } from "drizzle-orm/mysql2";
import { 
  users, 
  healthCheckins, 
  weeklyPriorities, 
  celebrations,
  pipelineStages,
  pipelineCards,
  annualGoals,
  monthlyTargets,
  performanceSnapshots,
  insights
} from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

console.log("🌱 Seeding Growth Farm database with realistic data...");

// Helper to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// 1. Create team members
console.log("Creating team members...");
const teamMembers = [
  { openId: "zinhle-001", name: "Zinhle Ndlovu", email: "zinhle@growthfarm.co", role: "admin", currentHealthScore: 85, currentEnergyLevel: "High" },
  { openId: "thabo-002", name: "Thabo Mokoena", email: "thabo@growthfarm.co", role: "user", currentHealthScore: 72, currentEnergyLevel: "Med" },
  { openId: "mpumi-003", name: "Mpumi Dlamini", email: "mpumi@growthfarm.co", role: "user", currentHealthScore: 80, currentEnergyLevel: "High" },
  { openId: "naledi-004", name: "Naledi Khumalo", email: "naledi@growthfarm.co", role: "user", currentHealthScore: 68, currentEnergyLevel: "Low" },
  { openId: "bongani-005", name: "Bongani Sithole", email: "bongani@growthfarm.co", role: "user", currentHealthScore: 82, currentEnergyLevel: "High" },
];

for (const member of teamMembers) {
  await db.insert(users).values(member).onDuplicateKeyUpdate({ set: member });
}

const allUsers = await db.select().from(users);
console.log(`✓ Created ${allUsers.length} team members`);

// 2. Create health check-ins (last 30 days)
console.log("Creating health check-ins...");
const now = new Date();
for (let i = 0; i < 30; i++) {
  const date = new Date(now);
  date.setDate(date.getDate() - i);
  
  for (const user of allUsers) {
    const baseScore = user.currentHealthScore || 75;
    const variance = Math.floor(Math.random() * 20) - 10;
    const score = Math.max(40, Math.min(100, baseScore + variance));
    
    await db.insert(healthCheckins).values({
      userId: user.id,
      score,
      mood: score >= 75 ? "happy" : score >= 60 ? "neutral" : "sad",
      energyLevel: score >= 75 ? "High" : score >= 60 ? "Med" : "Low",
      checkinDate: date,
    });
  }
}
console.log("✓ Created 30 days of health check-ins");

// 3. Create weekly priorities (current week)
console.log("Creating weekly priorities...");
const currentWeek = getWeekNumber(now);
const currentYear = now.getFullYear();

const priorities = [
  { userId: allUsers[0].id, description: "Close Vodacom deal (R400K)", status: "in-progress", dueDate: new Date(2026, 0, 31) },
  { userId: allUsers[0].id, description: "Finalize IFC Agriculture proposal", status: "pending", dueDate: new Date(2026, 1, 3) },
  { userId: allUsers[1].id, description: "Launch Briansfomo MVP", status: "in-progress", dueDate: new Date(2026, 0, 30) },
  { userId: allUsers[2].id, description: "Submit VAT Return", status: "blocked", dueDate: new Date(2026, 0, 25) },
  { userId: allUsers[2].id, description: "Update contractor agreements", status: "pending", dueDate: new Date(2026, 1, 5) },
  { userId: allUsers[3].id, description: "Complete Nedbank design sprint", status: "in-progress", dueDate: new Date(2026, 1, 7) },
  { userId: allUsers[4].id, description: "Prepare Q1 financial report", status: "pending", dueDate: new Date(2026, 1, 10) },
];

for (const priority of priorities) {
  await db.insert(weeklyPriorities).values({
    ...priority,
    weekNumber: currentWeek,
    year: currentYear,
  });
}
console.log(`✓ Created ${priorities.length} weekly priorities`);

// 4. Create celebrations
console.log("Creating celebrations...");
const celebrationData = [
  { title: "Gates Foundation deal closed! (R1.2M)", description: "Congrats Zinhle & Thabo! 🎊", category: "deal", icon: "🏆", celebrationDate: new Date(2026, 0, 15), createdBy: allUsers[0].id },
  { title: "Happy Birthday Naledi! 🎈", description: "Wishing you an amazing year ahead!", category: "birthday", icon: "🎂", celebrationDate: new Date(2026, 0, 27), createdBy: allUsers[1].id },
  { title: "Mntase secured first pilot customer", description: "Great work team! 💪", category: "milestone", icon: "⭐", celebrationDate: new Date(2026, 0, 22), createdBy: allUsers[2].id },
  { title: "Reached 10,000 users on Briansfomo!", description: "Incredible growth milestone", category: "project", icon: "🚀", celebrationDate: new Date(2026, 0, 18), createdBy: allUsers[1].id },
  { title: "Team offsite was a huge success", description: "Great bonding and strategic planning", category: "personal", icon: "🌟", celebrationDate: new Date(2026, 0, 12), createdBy: allUsers[3].id },
];

for (const celebration of celebrationData) {
  await db.insert(celebrations).values(celebration);
}
console.log(`✓ Created ${celebrationData.length} celebrations`);

// 5. Create pipeline stages for all 6 categories
console.log("Creating pipeline stages...");
const stageConfigs = {
  bd: [
    { name: "Lead", order: 1, probabilityWeight: 10, color: "#8D6E63" },
    { name: "Discovery", order: 2, probabilityWeight: 40, color: "#8D6E63" },
    { name: "Proposal", order: 3, probabilityWeight: 60, color: "#8D6E63" },
    { name: "Negotiation", order: 4, probabilityWeight: 80, color: "#8D6E63" },
    { name: "Contracting", order: 5, probabilityWeight: 90, color: "#8D6E63" },
    { name: "Won", order: 6, probabilityWeight: 100, color: "#4A7C59" },
    { name: "Lost", order: 7, probabilityWeight: 0, color: "#8B4049" },
  ],
  ventures: [
    { name: "Idea Dump", order: 1, probabilityWeight: 5, color: "#D4A5A5" },
    { name: "Concept", order: 2, probabilityWeight: 20, color: "#D4A5A5" },
    { name: "Discovery", order: 3, probabilityWeight: 40, color: "#D4A5A5" },
    { name: "MVP Build", order: 4, probabilityWeight: 60, color: "#D4A5A5" },
    { name: "Pilot", order: 5, probabilityWeight: 80, color: "#D4A5A5" },
    { name: "Live", order: 6, probabilityWeight: 90, color: "#4A7C59" },
    { name: "Scaling", order: 7, probabilityWeight: 100, color: "#4A7C59" },
  ],
  studio: [
    { name: "Inquiry", order: 1, probabilityWeight: 20, color: "#4A7C59" },
    { name: "Scoping", order: 2, probabilityWeight: 40, color: "#4A7C59" },
    { name: "In Progress", order: 3, probabilityWeight: 70, color: "#4A7C59" },
    { name: "Review", order: 4, probabilityWeight: 85, color: "#4A7C59" },
    { name: "Delivered", order: 5, probabilityWeight: 100, color: "#4A7C59" },
  ],
  clients: [
    { name: "Onboarding", order: 1, probabilityWeight: 30, color: "#5C7A99" },
    { name: "Active", order: 2, probabilityWeight: 100, color: "#4A7C59" },
    { name: "At Risk", order: 3, probabilityWeight: 50, color: "#C9A227" },
    { name: "Churned", order: 4, probabilityWeight: 0, color: "#8B4049" },
  ],
  finance: [
    { name: "Pending", order: 1, probabilityWeight: 30, color: "#D97B3A" },
    { name: "Approved", order: 2, probabilityWeight: 70, color: "#D97B3A" },
    { name: "Paid", order: 3, probabilityWeight: 100, color: "#4A7C59" },
  ],
  admin: [
    { name: "To Do", order: 1, probabilityWeight: 0, color: "#7B68A6" },
    { name: "In Progress", order: 2, probabilityWeight: 50, color: "#7B68A6" },
    { name: "Done", order: 3, probabilityWeight: 100, color: "#4A7C59" },
  ],
};

const stageMap = {};
for (const [pipelineType, stages] of Object.entries(stageConfigs)) {
  stageMap[pipelineType] = [];
  for (const stage of stages) {
    const result = await db.insert(pipelineStages).values({
      pipelineType,
      ...stage,
    });
    stageMap[pipelineType].push({ ...stage, id: result[0].insertId });
  }
}
console.log("✓ Created pipeline stages for all 6 categories");

// 6. Create pipeline cards
console.log("Creating pipeline cards...");

// BD Pipeline
const bdCards = [
  { stageId: stageMap.bd[0].id, title: "Nedbank Digital", description: "Design sprint", value: "320000", ownerId: allUsers[0].id },
  { stageId: stageMap.bd[0].id, title: "Standard Bank", description: "UX audit", value: "180000", ownerId: allUsers[1].id },
  { stageId: stageMap.bd[1].id, title: "IBM Accelerator", description: "Programme", value: "400000", ownerId: allUsers[0].id, dueDate: new Date(2026, 1, 3) },
  { stageId: stageMap.bd[2].id, title: "IFC Agriculture", description: "Advisory", value: "850000", ownerId: allUsers[0].id },
  { stageId: stageMap.bd[2].id, title: "AGRA Phase 2", description: "Trade corridors", value: "620000", ownerId: allUsers[1].id },
  { stageId: stageMap.bd[3].id, title: "Vodacom", description: "Digital transformation", value: "400000", ownerId: allUsers[0].id },
  { stageId: stageMap.bd[5].id, title: "Gates Foundation", description: "R&D Strategy", value: "1200000", ownerId: allUsers[0].id },
];

// Ventures Pipeline
const venturesCards = [
  { stageId: stageMap.ventures[2].id, title: "Mntase Communities", description: "Student accommodation platform", value: "0", ownerId: allUsers[0].id, tags: JSON.stringify(["proptech", "education"]) },
  { stageId: stageMap.ventures[3].id, title: "Briansfomo", description: "Curated gatherings marketplace", value: "0", ownerId: allUsers[0].id, tags: JSON.stringify(["events", "social"]) },
];

// Studio Pipeline
const studioCards = [
  { stageId: stageMap.studio[2].id, title: "FNB Mobile App Redesign", description: "Complete UI/UX overhaul", value: "450000", ownerId: allUsers[3].id },
  { stageId: stageMap.studio[2].id, title: "Shoprite E-commerce", description: "Online grocery platform", value: "680000", ownerId: allUsers[3].id },
  { stageId: stageMap.studio[3].id, title: "Discovery Health Portal", description: "Patient portal design", value: "320000", ownerId: allUsers[3].id },
];

// Clients Pipeline
const clientsCards = [
  { stageId: stageMap.clients[1].id, title: "Gates Foundation", description: "Strategic partner", value: "0", ownerId: allUsers[0].id },
  { stageId: stageMap.clients[1].id, title: "Vodacom", description: "Enterprise client", value: "0", ownerId: allUsers[0].id },
  { stageId: stageMap.clients[2].id, title: "Old Mutual", description: "Delayed payments", value: "0", ownerId: allUsers[2].id },
];

// Finance Pipeline
const financeCards = [
  { stageId: stageMap.finance[0].id, title: "IBM Accelerator Invoice", description: "R400K pending approval", value: "400000", ownerId: allUsers[4].id },
  { stageId: stageMap.finance[1].id, title: "Vodacom Payment", description: "Approved, awaiting transfer", value: "400000", ownerId: allUsers[4].id },
  { stageId: stageMap.finance[2].id, title: "Gates Foundation", description: "First milestone paid", value: "600000", ownerId: allUsers[4].id },
];

// Admin Pipeline
const adminCards = [
  { stageId: stageMap.admin[0].id, title: "Contractor Agreements", description: "Update all contractor agreements", value: "0", ownerId: allUsers[2].id },
  { stageId: stageMap.admin[1].id, title: "VAT Return", description: "Due 25 Jan", value: "0", ownerId: allUsers[2].id },
  { stageId: stageMap.admin[0].id, title: "Client MSAs", description: "2 expiring soon", value: "0", ownerId: allUsers[2].id },
];

const allCards = [...bdCards, ...venturesCards, ...studioCards, ...clientsCards, ...financeCards, ...adminCards];
for (const card of allCards) {
  await db.insert(pipelineCards).values(card);
}
console.log(`✓ Created ${allCards.length} pipeline cards`);

// 7. Create annual goals
console.log("Creating annual goals...");
const goals = [
  { category: "revenue", description: "Annual Revenue", targetValue: "24000000", targetUnit: "ZAR", ownerId: allUsers[0].id, year: 2026, distributionStrategy: "custom" },
  { category: "revenue", description: "New Clients", targetValue: "12", targetUnit: "count", ownerId: allUsers[1].id, year: 2026, distributionStrategy: "custom" },
  { category: "ventures", description: "Launch to Pilot", targetValue: "3", targetUnit: "count", ownerId: allUsers[2].id, year: 2026, distributionStrategy: "milestone" },
  { category: "ventures", description: "Active Ventures", targetValue: "5", targetUnit: "count", ownerId: allUsers[2].id, year: 2026, distributionStrategy: "linear" },
  { category: "studio", description: "Client Projects", targetValue: "20", targetUnit: "count", ownerId: allUsers[3].id, year: 2026, distributionStrategy: "linear" },
  { category: "finance", description: "Cash Reserves", targetValue: "500000", targetUnit: "ZAR", ownerId: allUsers[4].id, year: 2026, distributionStrategy: "linear" },
  { category: "finance", description: "Profit Margin", targetValue: "25", targetUnit: "percentage", ownerId: allUsers[4].id, year: 2026, distributionStrategy: "linear" },
  { category: "team", description: "Team Size", targetValue: "8", targetUnit: "count", ownerId: allUsers[0].id, year: 2026, distributionStrategy: "milestone" },
  { category: "team", description: "Employee Satisfaction", targetValue: "85", targetUnit: "percentage", ownerId: allUsers[0].id, year: 2026, distributionStrategy: "linear" },
  { category: "admin", description: "Compliance Score", targetValue: "100", targetUnit: "percentage", ownerId: allUsers[2].id, year: 2026, distributionStrategy: "linear" },
];

const createdGoals = [];
for (const goal of goals) {
  const result = await db.insert(annualGoals).values(goal);
  createdGoals.push({ ...goal, id: result[0].insertId });
}
console.log(`✓ Created ${goals.length} annual goals`);

// 8. Create monthly targets with seasonality for revenue goal
console.log("Creating monthly targets...");
const revenueGoal = createdGoals[0];
const monthlyWeights = [
  { month: 1, weight: 6.25, rationale: "Post-holiday slow period" },
  { month: 2, weight: 6.25, rationale: "Recovery period" },
  { month: 3, weight: 9.17, rationale: "Budget releases, Q1 push" },
  { month: 4, weight: 9.17, rationale: "Continued Q1 momentum" },
  { month: 5, weight: 7.50, rationale: "Mid-year slowdown" },
  { month: 6, weight: 7.50, rationale: "Pre-summer period" },
  { month: 7, weight: 10.42, rationale: "New fiscal year for many clients" },
  { month: 8, weight: 10.42, rationale: "High activity period" },
  { month: 9, weight: 9.58, rationale: "Q3 push" },
  { month: 10, weight: 9.58, rationale: "Year-end preparation" },
  { month: 11, weight: 6.67, rationale: "Holiday slowdown" },
  { month: 12, weight: 6.67, rationale: "Year-end close" },
];

for (const { month, weight, rationale } of monthlyWeights) {
  const targetValue = (24000000 * weight / 100).toFixed(2);
  const actualValue = month === 1 ? "1800000" : "0"; // January actual
  
  await db.insert(monthlyTargets).values({
    goalId: revenueGoal.id,
    month,
    year: 2026,
    targetValue,
    actualValue,
    weight: weight.toFixed(2),
    rationale,
  });
}
console.log("✓ Created monthly targets with seasonality");

// 9. Create performance snapshots (last 6 months)
console.log("Creating performance snapshots...");
const metrics = [
  { name: "revenue", category: "revenue", values: [1200000, 1350000, 1500000, 1600000, 1650000, 1800000] },
  { name: "pipeline_value", category: "pipeline", values: [1500000, 1700000, 1900000, 2000000, 1900000, 2100000] },
  { name: "new_leads", category: "revenue", values: [15, 18, 12, 14, 12, 8] },
  { name: "conversion_rate", category: "revenue", values: [12, 14, 15, 16, 15, 18] },
  { name: "avg_deal_size", category: "revenue", values: [320000, 350000, 380000, 400000, 380000, 450000] },
  { name: "client_health", category: "clients", values: [68, 70, 72, 75, 72, 75] },
];

for (let i = 0; i < 6; i++) {
  const date = new Date(2025, 7 + i, 1); // Aug 2025 - Jan 2026
  
  for (const metric of metrics) {
    await db.insert(performanceSnapshots).values({
      metricName: metric.name,
      metricCategory: metric.category,
      value: metric.values[i].toString(),
      unit: metric.name.includes("rate") || metric.name.includes("health") ? "percentage" : metric.name.includes("leads") ? "count" : "ZAR",
      snapshotDate: date,
    });
  }
}
console.log("✓ Created 6 months of performance snapshots");

// 10. Create insights
console.log("Creating insights...");
const insightData = [
  { metricName: "revenue", insightType: "working", content: "BD pipeline conversion up 15% (Oct-Jan). Average deal size increased from R320K to R450K.", priority: "high" },
  { metricName: "revenue", insightType: "working", content: "Client retention at 100% with no churn in the past 6 months.", priority: "medium" },
  { metricName: "revenue", insightType: "challenge", content: "Lead generation down 25% in Dec-Jan. Only 8 new leads vs target of 12.", priority: "high" },
  { metricName: "revenue", insightType: "challenge", content: "Sales cycle lengthened from 45 days to 62 days. Deals taking longer to close.", priority: "high" },
  { metricName: "revenue", insightType: "challenge", content: "3 deals stuck in Proposal stage for 60+ days (IFC Agriculture, AGRA Phase 2, Vodacom).", priority: "medium" },
  { metricName: "revenue", insightType: "recommendation", content: "Increase outbound BD activity to 10 new leads per week to compensate for seasonal slowdown.", priority: "high" },
  { metricName: "revenue", insightType: "recommendation", content: "Review pricing strategy - longer sales cycles may indicate price resistance.", priority: "medium" },
  { metricName: "revenue", insightType: "recommendation", content: "Assign dedicated resource to unstick proposal-stage deals. Consider offering time-limited incentives.", priority: "high" },
];

for (const insight of insightData) {
  await db.insert(insights).values({
    ...insight,
    generatedAt: new Date(),
    validUntil: new Date(2026, 2, 1), // Valid until end of Feb
  });
}
console.log(`✓ Created ${insightData.length} insights`);

console.log("\n✅ Database seeding complete!");
console.log("\nSummary:");
console.log(`- ${allUsers.length} team members`);
console.log(`- 150 health check-ins (30 days × 5 members)`);
console.log(`- ${priorities.length} weekly priorities`);
console.log(`- ${celebrationData.length} celebrations`);
console.log(`- ${Object.keys(stageMap).length} pipeline categories with stages`);
console.log(`- ${allCards.length} pipeline cards`);
console.log(`- ${goals.length} annual goals`);
console.log(`- 12 monthly targets (with seasonality)`);
console.log(`- ${metrics.length * 6} performance snapshots (6 months)`);
console.log(`- ${insightData.length} insights`);
