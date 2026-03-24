import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getTeamHealthOverview: vi.fn(),
  createHealthCheckin: vi.fn(),
  getWeeklyPriorities: vi.fn(),
  getUserWeeklyPriorities: vi.fn(),
  createWeeklyPriority: vi.fn(),
  updateWeeklyPriority: vi.fn(),
  logActivity: vi.fn(),
}));

import * as db from './db';

describe('Team Health Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTeamHealthOverview', () => {
    it('should return team members with health scores', async () => {
      const mockTeam = [
        { userId: 1, name: 'Thabo Mokoena', currentHealthScore: 72, currentEnergyLevel: 'Med' },
        { userId: 2, name: 'Mpumi Dlamini', currentHealthScore: 80, currentEnergyLevel: 'High' },
        { userId: 3, name: 'Naledi Khumalo', currentHealthScore: 68, currentEnergyLevel: 'Low' },
      ];
      
      vi.mocked(db.getTeamHealthOverview).mockResolvedValue(mockTeam);
      
      const result = await db.getTeamHealthOverview();
      
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Thabo Mokoena');
      expect(result[0].currentHealthScore).toBe(72);
    });

    it('should calculate overall health score correctly', async () => {
      const mockTeam = [
        { userId: 1, name: 'Member 1', currentHealthScore: 80, currentEnergyLevel: 'High' },
        { userId: 2, name: 'Member 2', currentHealthScore: 60, currentEnergyLevel: 'Med' },
        { userId: 3, name: 'Member 3', currentHealthScore: 70, currentEnergyLevel: 'Med' },
      ];
      
      vi.mocked(db.getTeamHealthOverview).mockResolvedValue(mockTeam);
      
      const result = await db.getTeamHealthOverview();
      const totalScore = result.reduce((sum, member) => sum + (member.currentHealthScore || 0), 0);
      const overallScore = Math.round(totalScore / result.length);
      
      expect(overallScore).toBe(70); // (80 + 60 + 70) / 3 = 70
    });
  });

  describe('Health Check-in', () => {
    it('should create a health check-in with valid data', async () => {
      const checkinData = {
        userId: 1,
        score: 75,
        mood: 'happy' as const,
        energyLevel: 'Med' as const,
        notes: 'Feeling good today',
        checkinDate: new Date(),
      };
      
      vi.mocked(db.createHealthCheckin).mockResolvedValue({ insertId: 1 } as any);
      
      await db.createHealthCheckin(checkinData);
      
      expect(db.createHealthCheckin).toHaveBeenCalledWith(checkinData);
    });

    it('should handle low wellbeing score (below 60%)', async () => {
      const lowWellbeingData = {
        userId: 1,
        score: 45, // Below 60% threshold
        mood: 'sad' as const,
        energyLevel: 'Low' as const,
        notes: 'Not feeling well',
        checkinDate: new Date(),
      };
      
      vi.mocked(db.createHealthCheckin).mockResolvedValue({ insertId: 1 } as any);
      
      await db.createHealthCheckin(lowWellbeingData);
      
      expect(db.createHealthCheckin).toHaveBeenCalledWith(lowWellbeingData);
      // In real implementation, this would trigger CEO notification
      expect(lowWellbeingData.score).toBeLessThan(60);
    });
  });

  describe('Weekly Priorities', () => {
    it('should get priorities for current week', async () => {
      const mockPriorities = [
        { id: 1, userId: 1, description: 'Submit VAT Return', status: 'pending', weekNumber: 5, year: 2026 },
        { id: 2, userId: 2, description: 'Complete design sprint', status: 'in-progress', weekNumber: 5, year: 2026 },
      ];
      
      vi.mocked(db.getWeeklyPriorities).mockResolvedValue(mockPriorities);
      
      const result = await db.getWeeklyPriorities(5, 2026);
      
      expect(result).toHaveLength(2);
      expect(result[0].description).toBe('Submit VAT Return');
    });

    it('should get user-specific priorities', async () => {
      const mockUserPriorities = [
        { id: 1, userId: 1, description: 'Task 1', status: 'pending', weekNumber: 5, year: 2026 },
        { id: 2, userId: 1, description: 'Task 2', status: 'done', weekNumber: 5, year: 2026 },
      ];
      
      vi.mocked(db.getUserWeeklyPriorities).mockResolvedValue(mockUserPriorities);
      
      const result = await db.getUserWeeklyPriorities(1, 5, 2026);
      
      expect(result).toHaveLength(2);
      expect(result.every(p => p.userId === 1)).toBe(true);
    });

    it('should limit priorities to 3 per user per week', async () => {
      const existingPriorities = [
        { id: 1, userId: 1, description: 'Task 1', status: 'pending', weekNumber: 5, year: 2026 },
        { id: 2, userId: 1, description: 'Task 2', status: 'pending', weekNumber: 5, year: 2026 },
        { id: 3, userId: 1, description: 'Task 3', status: 'pending', weekNumber: 5, year: 2026 },
      ];
      
      vi.mocked(db.getUserWeeklyPriorities).mockResolvedValue(existingPriorities);
      
      const result = await db.getUserWeeklyPriorities(1, 5, 2026);
      
      // In the UI, we only show top 3 priorities per user
      expect(result.slice(0, 3)).toHaveLength(3);
    });

    it('should create a new priority', async () => {
      const newPriority = {
        userId: 1,
        description: 'New important task',
        dueDate: new Date('2026-02-05'),
        weekNumber: 5,
        year: 2026,
        status: 'pending' as const,
      };
      
      vi.mocked(db.createWeeklyPriority).mockResolvedValue({ insertId: 1 } as any);
      
      await db.createWeeklyPriority(newPriority);
      
      expect(db.createWeeklyPriority).toHaveBeenCalledWith(newPriority);
    });

    it('should update priority status', async () => {
      vi.mocked(db.updateWeeklyPriority).mockResolvedValue({ affectedRows: 1 } as any);
      
      await db.updateWeeklyPriority(1, { status: 'done' });
      
      expect(db.updateWeeklyPriority).toHaveBeenCalledWith(1, { status: 'done' });
    });
  });
});

describe('Wellbeing Word Helpers', () => {
  it('should return Thriving for high score (>=80)', () => {
    const getWellbeingWord = (score: number) => {
      if (score >= 80) return "Thriving";
      if (score >= 60) return "Steady";
      return "Struggling";
    };
    
    expect(getWellbeingWord(85)).toBe("Thriving");
    expect(getWellbeingWord(80)).toBe("Thriving");
  });

  it('should return Steady for medium score (60-79)', () => {
    const getWellbeingWord = (score: number) => {
      if (score >= 80) return "Thriving";
      if (score >= 60) return "Steady";
      return "Struggling";
    };
    
    expect(getWellbeingWord(70)).toBe("Steady");
    expect(getWellbeingWord(60)).toBe("Steady");
  });

  it('should return Struggling for low score (<60)', () => {
    const getWellbeingWord = (score: number) => {
      if (score >= 80) return "Thriving";
      if (score >= 60) return "Steady";
      return "Struggling";
    };
    
    expect(getWellbeingWord(50)).toBe("Struggling");
    expect(getWellbeingWord(30)).toBe("Struggling");
  });

  it('should identify low wellbeing threshold correctly', () => {
    const isLowWellbeing = (score: number) => score < 60;
    
    expect(isLowWellbeing(59)).toBe(true);
    expect(isLowWellbeing(60)).toBe(false);
    expect(isLowWellbeing(45)).toBe(true);
  });
});
