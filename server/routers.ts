import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import * as db from "./db";

// Helper to get current week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: protectedProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================================================
  // TEAM HEALTH
  // ============================================================================
  health: router({
    // Get team health overview
    getTeamOverview: protectedProcedure.query(async () => {
      const team = await db.getTeamHealthOverview();
      
      // Calculate overall health score
      const totalScore = team.reduce((sum, member) => sum + (member.currentHealthScore || 0), 0);
      const overallScore = team.length > 0 ? Math.round(totalScore / team.length) : 0;
      
      return {
        overallScore,
        team,
      };
    }),

    // Submit health check-in
    submitCheckin: protectedProcedure
      .input(z.object({
        score: z.number().min(0).max(100),
        mood: z.enum(["happy", "neutral", "sad"]),
        energyLevel: z.enum(["High", "Med", "Low"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const checkin = await db.createHealthCheckin({
          userId: ctx.user.id,
          score: input.score,
          mood: input.mood,
          energyLevel: input.energyLevel,
          notes: input.notes,
          checkinDate: new Date(),
        });

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          actionType: "health_checkin",
          entityType: "health_checkin",
          entityId: ctx.user.id,
          newValue: JSON.stringify({ score: input.score, mood: input.mood, energyLevel: input.energyLevel }),
          description: `${ctx.user.name} submitted health check-in: ${input.score}%`,
          timestamp: Date.now(),
        });

        return checkin;
      }),

    // Get user's recent check-ins
    getMyCheckins: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        return db.getRecentHealthCheckins(ctx.user.id, input.limit);
      }),
  }),

  // ============================================================================
  // WEEKLY PRIORITIES
  // ============================================================================
  priorities: router({
    // Get current week's priorities
    getCurrentWeek: protectedProcedure.query(async () => {
      const now = new Date();
      const weekNumber = getWeekNumber(now);
      const year = now.getFullYear();
      return db.getWeeklyPriorities(weekNumber, year);
    }),

    // Get user's priorities for current week
    getMyPriorities: protectedProcedure.query(async ({ ctx }) => {
      const now = new Date();
      const weekNumber = getWeekNumber(now);
      const year = now.getFullYear();
      return db.getUserWeeklyPriorities(ctx.user.id, weekNumber, year);
    }),

    // Create new priority
    create: protectedProcedure
      .input(z.object({
        description: z.string().min(1),
        dueDate: z.date(),
        linkedGoalId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const now = new Date();
        const weekNumber = getWeekNumber(input.dueDate);
        const year = input.dueDate.getFullYear();

        // Check if user already has 5 priorities for this week
        const existing = await db.getUserWeeklyPriorities(ctx.user.id, weekNumber, year);
        if (existing.length >= 5) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Maximum 5 priorities per week allowed",
          });
        }

        const priority = await db.createWeeklyPriority({
          userId: ctx.user.id,
          description: input.description,
          dueDate: input.dueDate,
          weekNumber,
          year,
          linkedGoalId: input.linkedGoalId,
          status: "pending",
        });

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          actionType: "priority_added",
          entityType: "weekly_priority",
          entityId: ctx.user.id,
          newValue: JSON.stringify(input),
          description: `${ctx.user.name} added priority: ${input.description}`,
          timestamp: Date.now(),
        });

        return priority;
      }),

    // Update priority
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        status: z.enum(["pending", "in-progress", "done", "blocked"]).optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        
        const result = await db.updateWeeklyPriority(id, updates);

        // Log activity if status changed to done
        if (input.status === "done") {
          await db.logActivity({
            userId: ctx.user.id,
            actionType: "priority_completed",
            entityType: "weekly_priority",
            entityId: id,
            newValue: JSON.stringify(input),
            description: `${ctx.user.name} completed priority`,
            timestamp: Date.now(),
          });
        }

        return result;
      }),

    // Delete priority
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteWeeklyPriority(input.id);
      }),
  }),

  // ============================================================================
  // CELEBRATIONS
  // ============================================================================
  celebrations: router({
    // Get recent celebrations
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return db.getRecentCelebrations(input.limit);
      }),

    // Create celebration
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.enum(["deal", "birthday", "milestone", "project", "personal"]),
        icon: z.string().default("🎉"),
        celebrationDate: z.date(),
        taggedUsers: z.array(z.number()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const celebration = await db.createCelebration({
          title: input.title,
          description: input.description,
          category: input.category,
          icon: input.icon,
          celebrationDate: input.celebrationDate,
          createdBy: ctx.user.id,
          taggedUsers: input.taggedUsers ? JSON.stringify(input.taggedUsers) : null,
        });

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          actionType: "celebration_added",
          entityType: "celebration",
          entityId: ctx.user.id,
          newValue: JSON.stringify(input),
          description: `${ctx.user.name} added celebration: ${input.title}`,
          timestamp: Date.now(),
        });

        return celebration;
      }),

    // Delete celebration
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteCelebration(input.id);
      }),
  }),

  // ============================================================================
  // CEO REFLECTIONS
  // ============================================================================
  ceoReflections: router({
    // Get CEO reflection for current week
    getCurrentWeek: protectedProcedure.query(async () => {
      const now = new Date();
      const weekNumber = getWeekNumber(now);
      const year = now.getFullYear();
      return db.getCeoReflectionForWeek(weekNumber, year);
    }),

    // Get CEO reflection for specific week
    getForWeek: protectedProcedure
      .input(z.object({
        weekNumber: z.number(),
        year: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getCeoReflectionForWeek(input.weekNumber, input.year);
      }),

    // Create or update CEO reflection
    upsert: protectedProcedure
      .input(z.object({
        content: z.string().min(1),
        weekNumber: z.number().optional(),
        year: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only allow CEO/admin to create reflections
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only CEO/admin can create reflections",
          });
        }

        const now = new Date();
        const weekNumber = input.weekNumber || getWeekNumber(now);
        const year = input.year || now.getFullYear();

        // Check if reflection exists for this week
        const existing = await db.getCeoReflectionForWeek(weekNumber, year);

        if (existing) {
          // Update existing
          await db.updateCeoReflection(existing.id, input.content);
          return { id: existing.id, updated: true };
        } else {
          // Create new
          await db.createCeoReflection({
            content: input.content,
            weekNumber,
            year,
            createdBy: ctx.user.id,
          });
          return { updated: false };
        }
      }),

    // Get recent reflections
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getRecentCeoReflections(input.limit);
      }),
  }),

  // ============================================================================
  // PIPELINES
  // ============================================================================
  pipelines: router({
    // Get stages for a pipeline type
    getStages: protectedProcedure
      .input(z.object({
        pipelineType: z.enum(["bd", "ventures", "studio", "clients", "finance", "admin"]),
      }))
      .query(async ({ input }) => {
        return db.getPipelineStages(input.pipelineType);
      }),

    // Get all cards for a pipeline type
    getCards: protectedProcedure
      .input(z.object({
        pipelineType: z.enum(["bd", "ventures", "studio", "clients", "finance", "admin"]),
      }))
      .query(async ({ input }) => {
        const stages = await db.getPipelineStages(input.pipelineType);
        const cards = await db.getPipelineCardsByType(input.pipelineType);
        
        return {
          stages,
          cards,
        };
      }),

    // Create new card
    createCard: protectedProcedure
      .input(z.object({
        stageId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        value: z.string().optional(),
        ownerId: z.number().optional(),
        dueDate: z.date().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const card = await db.createPipelineCard({
          stageId: input.stageId,
          title: input.title,
          description: input.description,
          value: input.value,
          ownerId: input.ownerId,
          dueDate: input.dueDate,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          position: 0,
        });

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          actionType: "card_created",
          entityType: "pipeline_card",
          entityId: ctx.user.id,
          newValue: JSON.stringify(input),
          description: `${ctx.user.name} created card: ${input.title}`,
          timestamp: Date.now(),
        });

        return card;
      }),

    // Move card to different stage
    moveCard: protectedProcedure
      .input(z.object({
        cardId: z.number(),
        newStageId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.movePipelineCard(input.cardId, input.newStageId);

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          actionType: "card_moved",
          entityType: "pipeline_card",
          entityId: input.cardId,
          newValue: JSON.stringify({ newStageId: input.newStageId }),
          description: `${ctx.user.name} moved card to new stage`,
          timestamp: Date.now(),
        });

        return result;
      }),

    // Update card
    updateCard: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        value: z.string().optional(),
        ownerId: z.number().optional(),
        dueDate: z.date().optional(),
        burnRate: z.number().optional(),
        daysToRevenue: z.string().optional(),
        status: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, burnRate, daysToRevenue, status, metadata, ...updates } = input;
        
        if (burnRate !== undefined || daysToRevenue !== undefined || status !== undefined || metadata) {
          const existingCard = await db.getPipelineCard(id);
          const existingMetadata = existingCard?.metadata ? JSON.parse(existingCard.metadata) : {};
          
          const newMetadata = {
            ...existingMetadata,
            ...(burnRate !== undefined && { burnRate }),
            ...(daysToRevenue !== undefined && { daysToRevenue }),
            ...(status !== undefined && { status }),
            ...metadata,
          };
          
          (updates as any).metadata = JSON.stringify(newMetadata);
        }
        
        const result = await db.updatePipelineCard(id, updates);

        await db.logActivity({
          userId: ctx.user.id,
          actionType: "card_updated",
          entityType: "pipeline_card",
          entityId: id,
          newValue: JSON.stringify(input),
          description: `${ctx.user.name} updated card`,
          timestamp: Date.now(),
        });

        return result;
      }),

    // Delete card
    deleteCard: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deletePipelineCard(input.id);
      }),
  }),

  // ============================================================================
  // ANNUAL GOALS & MONTHLY CASCADE
  // ============================================================================
  goals: router({
    // Get all goals for a year
    getAnnual: protectedProcedure
      .input(z.object({ year: z.number() }))
      .query(async ({ input }) => {
        return db.getAnnualGoals(input.year);
      }),

    // Get goals with status based on weekly activity linkage
    getWithStatus: protectedProcedure
      .input(z.object({ year: z.number() }))
      .query(async ({ input }) => {
        return db.getKPIStatusWithActivities(input.year);
      }),

    // Create annual goal (admin only)
    create: protectedProcedure
      .input(z.object({
        strategicObjective: z.string().min(1),
        goalName: z.string().min(1),
        targetValue: z.string(),
        targetUnit: z.string(),
        ownerId: z.number().optional(),
        ownerName: z.string().optional(),
        year: z.number(),
        distributionStrategy: z.enum(["linear", "custom", "historical", "milestone"]).default("linear"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can create KPIs' });
        }
        const goal = await db.createAnnualGoal(input);

        await db.logActivity({
          userId: ctx.user.id,
          actionType: "goal_created",
          entityType: "annual_goal",
          entityId: ctx.user.id,
          newValue: JSON.stringify(input),
          description: `${ctx.user.name} created goal: ${input.goalName}`,
          timestamp: Date.now(),
        });

        return goal;
      }),

    // Update annual goal (admin only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        strategicObjective: z.string().optional(),
        goalName: z.string().optional(),
        targetValue: z.string().optional(),
        targetUnit: z.string().optional(),
        ownerId: z.number().optional(),
        ownerName: z.string().optional(),
        distributionStrategy: z.enum(["linear", "custom", "historical", "milestone"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can update KPIs' });
        }
        const { id, ...updates } = input;

        const result = await db.updateAnnualGoal(id, updates);

        await db.logActivity({
          userId: ctx.user.id,
          actionType: "goal_updated",
          entityType: "annual_goal",
          entityId: id,
          newValue: JSON.stringify(updates),
          description: `${ctx.user.name} updated goal`,
          timestamp: Date.now(),
        });

        return result;
      }),

    // Delete annual goal (admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can delete KPIs' });
        }
        return db.deleteAnnualGoal(input.id);
      }),

    // Generate monthly cascade (admin only)
    generateCascade: protectedProcedure
      .input(z.object({
        goalId: z.number(),
        customWeights: z.array(z.object({
          month: z.number(),
          weight: z.number(),
          rationale: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can generate cascades' });
        }
        const goals = await db.getAnnualGoals(new Date().getFullYear());
        const goal = goals.find(g => g.id === input.goalId);

        if (!goal) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Goal not found" });
        }

        const targetValue = parseFloat(goal.targetValue);
        const targets: any[] = [];

        if (input.customWeights && input.customWeights.length === 12) {
          // Custom distribution
          for (const weight of input.customWeights) {
            const monthlyValue = (targetValue * weight.weight / 100).toFixed(2);
            targets.push({
              goalId: input.goalId,
              month: weight.month,
              year: goal.year,
              targetValue: monthlyValue,
              weight: weight.weight.toFixed(2),
              rationale: weight.rationale,
              actualValue: "0",
            });
          }
        } else {
          // Linear distribution
          const monthlyValue = (targetValue / 12).toFixed(2);
          for (let month = 1; month <= 12; month++) {
            targets.push({
              goalId: input.goalId,
              month,
              year: goal.year,
              targetValue: monthlyValue,
              weight: "8.33",
              rationale: "Linear distribution",
              actualValue: "0",
            });
          }
        }

        await db.bulkCreateMonthlyTargets(targets);

        return { success: true, targets };
      }),

    // Get monthly targets for a goal
    getMonthlyTargets: protectedProcedure
      .input(z.object({ goalId: z.number() }))
      .query(async ({ input }) => {
        return db.getMonthlyTargets(input.goalId);
      }),

    // Get all monthly targets for a year (with goal info)
    getAllMonthlyForYear: protectedProcedure
      .input(z.object({ year: z.number() }))
      .query(async ({ input }) => {
        return db.getAllMonthlyTargetsForYear(input.year);
      }),

    // Update monthly target actual value
    updateMonthlyActual: protectedProcedure
      .input(z.object({
        id: z.number(),
        actualValue: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.updateMonthlyTarget(input.id, { actualValue: input.actualValue });

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          actionType: "target_updated",
          entityType: "monthly_target",
          entityId: input.id,
          newValue: JSON.stringify({ actualValue: input.actualValue }),
          description: `${ctx.user.name} updated monthly target actual value`,
          timestamp: Date.now(),
        });

        return result;
      }),

    // Update monthly target value by goalId + month + year (admin only)
    updateMonthlyTargetValue: adminProcedure
      .input(z.object({
        goalId: z.number(),
        month: z.number(),
        year: z.number(),
        targetValue: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.updateMonthlyTargetByGoalMonth(
          input.goalId,
          input.month,
          input.year,
          { targetValue: input.targetValue }
        );

        await db.logActivity({
          userId: ctx.user.id,
          actionType: "target_updated",
          entityType: "monthly_target",
          entityId: input.goalId,
          newValue: JSON.stringify({ targetValue: input.targetValue, month: input.month }),
          description: `${ctx.user.name} set monthly target value`,
          timestamp: Date.now(),
        });

        return result;
      }),

    // Update monthly actual value by goalId + month + year
    updateMonthlyActualByGoalMonth: protectedProcedure
      .input(z.object({
        goalId: z.number(),
        month: z.number(),
        year: z.number(),
        actualValue: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.updateMonthlyTargetByGoalMonth(
          input.goalId,
          input.month,
          input.year,
          { actualValue: input.actualValue }
        );

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          actionType: "target_updated",
          entityType: "monthly_target",
          entityId: input.goalId,
          newValue: JSON.stringify({ actualValue: input.actualValue, month: input.month }),
          description: `${ctx.user.name} updated monthly target actual value`,
          timestamp: Date.now(),
        });

        return result;
      }),

    // Seed default KPIs for all strategic objectives (admin only, idempotent)
    seedDefaults: protectedProcedure
      .input(z.object({ year: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can seed KPIs' });
        }
        const existing = await db.getAnnualGoals(input.year);
        if (existing.length > 0) {
          return { skipped: true, message: `${existing.length} KPIs already exist for ${input.year}` };
        }

        const defaults = [
          // Community Growth (20%)
          { strategicObjective: "Community Growth", goalName: "New Members Acquired",       targetValue: "50",       targetUnit: "#",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Community Growth", goalName: "Member Retention Rate",       targetValue: "80",       targetUnit: "%",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Community Growth", goalName: "Community Events Hosted",     targetValue: "24",       targetUnit: "#",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Community Growth", goalName: "New Partnerships Signed",     targetValue: "10",       targetUnit: "#",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Community Growth", goalName: "Community Engagement Score",  targetValue: "75",       targetUnit: "%",   year: input.year, distributionStrategy: "linear" as const },
          // Impact Delivery (25%)
          { strategicObjective: "Impact Delivery",  goalName: "Active Client Projects",      targetValue: "20",       targetUnit: "#",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Impact Delivery",  goalName: "Client Satisfaction Score",   targetValue: "85",       targetUnit: "%",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Impact Delivery",  goalName: "On-Time Delivery Rate",       targetValue: "90",       targetUnit: "%",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Impact Delivery",  goalName: "Annual Revenue",              targetValue: "24000000", targetUnit: "ZAR", year: input.year, distributionStrategy: "custom" as const },
          { strategicObjective: "Impact Delivery",  goalName: "Project Profit Margin",       targetValue: "25",       targetUnit: "%",   year: input.year, distributionStrategy: "linear" as const },
          // New Frontiers (20%)
          { strategicObjective: "New Frontiers",    goalName: "Ventures at Pilot Stage",     targetValue: "3",        targetUnit: "#",   year: input.year, distributionStrategy: "milestone" as const },
          { strategicObjective: "New Frontiers",    goalName: "New Concepts Validated",      targetValue: "10",       targetUnit: "#",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "New Frontiers",    goalName: "Active Ventures",             targetValue: "5",        targetUnit: "#",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "New Frontiers",    goalName: "Venture Revenue",             targetValue: "2000000",  targetUnit: "ZAR", year: input.year, distributionStrategy: "custom" as const },
          { strategicObjective: "New Frontiers",    goalName: "Innovation Partnerships",     targetValue: "6",        targetUnit: "#",   year: input.year, distributionStrategy: "linear" as const },
          // Stewardship (20%)
          { strategicObjective: "Stewardship",      goalName: "Cash Reserves",               targetValue: "1000000",  targetUnit: "ZAR", year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Stewardship",      goalName: "Profit Margin",               targetValue: "20",       targetUnit: "%",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Stewardship",      goalName: "Invoice Collection Rate",     targetValue: "95",       targetUnit: "%",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Stewardship",      goalName: "Cost Efficiency",             targetValue: "85",       targetUnit: "%",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Stewardship",      goalName: "Compliance Score",            targetValue: "100",      targetUnit: "%",   year: input.year, distributionStrategy: "linear" as const },
          // Purpose & Platform (15%)
          { strategicObjective: "Purpose & Platform", goalName: "Team Size",                 targetValue: "10",       targetUnit: "#",   year: input.year, distributionStrategy: "milestone" as const },
          { strategicObjective: "Purpose & Platform", goalName: "Employee Satisfaction",     targetValue: "85",       targetUnit: "%",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Purpose & Platform", goalName: "Training Hours",            targetValue: "100",      targetUnit: "#",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Purpose & Platform", goalName: "OKR Achievement Rate",      targetValue: "80",       targetUnit: "%",   year: input.year, distributionStrategy: "linear" as const },
          { strategicObjective: "Purpose & Platform", goalName: "Platform Uptime",           targetValue: "99",       targetUnit: "%",   year: input.year, distributionStrategy: "linear" as const },
        ];

        for (const goal of defaults) {
          await db.createAnnualGoal(goal);
        }

        return { seeded: true, count: defaults.length };
      }),
  }),

  // ============================================================================
  // ACTIVITY LOG
  // ============================================================================
  activity: router({
    // Get recent activity
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return db.getRecentActivity(input.limit);
      }),

    // Get activity for specific entity
    getByEntity: protectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getActivityByEntity(input.entityType, input.entityId);
      }),
  }),

  // ============================================================================
  // USERS
  // ============================================================================
  users: router({
    // Get all users
    getAll: protectedProcedure.query(async () => {
      return db.getAllUsers();
    }),

    // Update user (admin only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(["user", "admin"]).optional(),
        jobTitle: z.string().optional(),
        birthplace: z.string().optional(),
        lifePurpose: z.string().optional(),
        personalGoal: z.string().optional(),
        skillMastering: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can update team members',
          });
        }
        const { id, ...data } = input;
        return db.updateUser(id, data);
      }),

    // Delete user (admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can delete team members',
          });
        }
        // Prevent deleting yourself
        if (input.id === ctx.user.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot delete your own account',
          });
        }
        return db.deleteUser(input.id);
      }),

    // Update own profile (for onboarding)
    updateProfile: protectedProcedure
      .input(z.object({
        birthplace: z.string().optional(),
        lifePurpose: z.string().optional(),
        personalGoal: z.string().optional(),
        skillMastering: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updateUser(ctx.user.id, {
          birthplace: input.birthplace,
          lifePurpose: input.lifePurpose,
          personalGoal: input.personalGoal,
          skillMastering: input.skillMastering,
        });
      }),

    // Invite new team member (admin only)
    invite: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        role: z.enum(["user", "admin"]).optional(),
        jobTitle: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can invite team members',
          });
        }
        
        const result = await db.createInvitedUser(input);
        
        // Send notification to owner about new team member invitation
        const { notifyOwner } = await import('./_core/notification');
        await notifyOwner({
          title: `New Team Member Invited: ${input.name}`,
          content: `${ctx.user.name} has invited ${input.name} (${input.email}) to join Mpumi - Growth Farm.\n\nPlease send them the app link so they can sign in and access the platform.`,
        });
        
        return result;
      }),
  }),

  // ============================================================================
  // SYSTEM SETTINGS (Company Info)
  // ============================================================================
  settings: router({
    // Get all settings
    getAll: protectedProcedure.query(async () => {
      return db.getAllSettings();
    }),

    // Get a specific setting
    get: protectedProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return db.getSetting(input.key);
      }),

    // Save a setting (admin only)
    save: protectedProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        type: z.enum(["string", "number", "boolean", "json"]).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can update settings',
          });
        }
        return db.setSetting({
          settingKey: input.key,
          settingValue: input.value,
          settingType: input.type || "string",
          description: input.description,
          updatedBy: ctx.user.id,
        });
      }),
  }),

  // ============================================================================
  // WEEKLY ACTIVITIES
  // ============================================================================
  weeklyActivities: router({
    // Get activities for current user for a specific week
    getMine: protectedProcedure
      .input(z.object({ weekNumber: z.number(), year: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getWeeklyActivities(ctx.user.id, input.weekNumber, input.year);
      }),

    // Get all activities for a week (for team view)
    getAll: protectedProcedure
      .input(z.object({ weekNumber: z.number(), year: z.number() }))
      .query(async ({ input }) => {
        return db.getAllWeeklyActivities(input.weekNumber, input.year);
      }),

    // Get activities assigned to current user as partner or helper
    getAssigned: protectedProcedure
      .input(z.object({ weekNumber: z.number(), year: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getAssignedActivities(ctx.user.id, input.weekNumber, input.year);
      }),

    // Get all priorities for current week (activities marked as priority)
    getPriorities: protectedProcedure
      .input(z.object({ weekNumber: z.number(), year: z.number() }))
      .query(async ({ input }) => {
        const allActivities = await db.getAllWeeklyActivities(input.weekNumber, input.year);
        // Filter to only priority activities that are not done/deprioritised
        // The joined query returns { weeklyActivities: {...}, users: {...} }
        return allActivities?.filter(a => {
          const activity = (a as any).weekly_activities || (a as any).weeklyActivities || a;
          return activity.isPriority && activity.status !== 'done' && activity.status !== 'deprioritised';
        }).map(a => {
          const activity = (a as any).weekly_activities || (a as any).weeklyActivities || a;
          return {
            ...activity,
            userId: activity.userId,
          };
        }) || [];
      }),

    // Get dashboard overview with activity summary, status breakdown, and priorities
    getDashboardOverview: protectedProcedure
      .input(z.object({ weekNumber: z.number(), year: z.number() }))
      .query(async ({ input }) => {
        return db.getDashboardWeeklyOverview(input.weekNumber, input.year);
      }),

    // Create activity
    create: protectedProcedure
      .input(z.object({
        activity: z.string().min(1),
        dueDay: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
        dependency: z.string().optional(),
        accountabilityPartnerId: z.number().optional(),
        partnerRole: z.enum(["partner", "helper"]).optional(),
        monthlyGoalId: z.number().optional(),
        isPriority: z.boolean().optional(),
        weekNumber: z.number(),
        year: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // If marking as priority, check limit (max 3)
        if (input.isPriority) {
          const existingActivities = await db.getWeeklyActivities(ctx.user.id, input.weekNumber, input.year);
          const priorityCount = existingActivities?.filter(a => a.isPriority && a.status !== 'done' && a.status !== 'deprioritised').length || 0;
          if (priorityCount >= 3) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Maximum 3 priorities allowed per week",
            });
          }
        }
        return db.createWeeklyActivity({
          ...input,
          userId: ctx.user.id,
          status: "pending",
        });
      }),

    // Update activity
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        activity: z.string().optional(),
        dueDay: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]).optional(),
        dependency: z.string().optional(),
        accountabilityPartnerId: z.number().optional(),
        partnerRole: z.enum(["partner", "helper"]).nullable().optional(),
        monthlyGoalId: z.number().optional(),
        status: z.enum(["pending", "done", "delayed", "deprioritised"]).optional(),
        isPriority: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        
        // If status is being changed to "done" and there's a linked monthly goal,
        // increment the monthly actual value
        if (updates.status === "done") {
          // Get the activity to check if it has a linked goal
          const activities = await db.getWeeklyActivities(ctx.user.id, getWeekNumber(new Date()), new Date().getFullYear());
          const activity = activities?.find(a => a.id === id);
          
          if (activity?.monthlyGoalId) {
            // Get the current month's target for this goal
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            const monthlyTargetsData = await db.getAllMonthlyTargetsForYear(currentYear);
            const target = monthlyTargetsData?.find(
              t => t.monthlyTargets.goalId === activity.monthlyGoalId && t.monthlyTargets.month === currentMonth
            );
            
            if (target && !target.monthlyTargets.isLocked) {
              // Increment the actual value by 1 (for count-based KPIs)
              const currentActual = parseFloat(target.monthlyTargets.actualValue || "0");
              await db.updateMonthlyTarget(target.monthlyTargets.id, {
                actualValue: (currentActual + 1).toString()
              });
            }
          }
        }
        
        return db.updateWeeklyActivity(id, updates);
      }),

    // Delete activity
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteWeeklyActivity(input.id);
      }),
  }),

  // ============================================================================
  // STRATEGIC OBJECTIVES
  // ============================================================================
  strategicObjectives: router({
    // Get all objectives for a year
    getAll: protectedProcedure
      .input(z.object({ year: z.number() }))
      .query(async ({ input }) => {
        const objectives = await db.getStrategicObjectives(input.year);
        // If no objectives exist, initialize defaults
        if (objectives.length === 0) {
          return db.initializeDefaultObjectives(input.year);
        }
        return objectives;
      }),

    // Create new objective (admin only)
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        weight: z.number().min(0).max(100),
        icon: z.string().optional(),
        color: z.string().optional(),
        bgColor: z.string().optional(),
        displayOrder: z.number().optional(),
        year: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can create objectives',
          });
        }
        return db.createStrategicObjective(input);
      }),

    // Update objective (admin only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        weight: z.number().min(0).max(100).optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        bgColor: z.string().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can update objectives',
          });
        }
        const { id, ...updates } = input;
        return db.updateStrategicObjective(id, updates);
      }),

    // Delete objective (admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can delete objectives',
          });
        }
        return db.deleteStrategicObjective(input.id);
      }),

    // Bulk update weights (admin only)
    updateWeights: protectedProcedure
      .input(z.object({
        updates: z.array(z.object({
          id: z.number(),
          weight: z.number().min(0).max(100),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can update weights',
          });
        }
        // Update each objective's weight
        for (const update of input.updates) {
          await db.updateStrategicObjective(update.id, { weight: update.weight });
        }
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
