import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Dashboard Weekly Overview", () => {
  // Test the getDashboardWeeklyOverview function
  it("should return dashboard overview with status summary", async () => {
    const weekNumber = 12;
    const year = 2026;
    
    const overview = await db.getDashboardWeeklyOverview(weekNumber, year);
    
    // Verify the structure of the response
    expect(overview).toBeDefined();
    expect(overview).toHaveProperty("activities");
    expect(overview).toHaveProperty("statusSummary");
    expect(overview).toHaveProperty("priorityActivities");
    expect(overview).toHaveProperty("dueDayDistribution");
    expect(overview).toHaveProperty("totalActivities");
  });

  it("should have correct status summary structure", async () => {
    const weekNumber = 12;
    const year = 2026;
    
    const overview = await db.getDashboardWeeklyOverview(weekNumber, year);
    
    // Verify status summary has all required fields
    expect(overview.statusSummary).toHaveProperty("pending");
    expect(overview.statusSummary).toHaveProperty("done");
    expect(overview.statusSummary).toHaveProperty("delayed");
    expect(overview.statusSummary).toHaveProperty("deprioritised");
    
    // All should be numbers
    expect(typeof overview.statusSummary.pending).toBe("number");
    expect(typeof overview.statusSummary.done).toBe("number");
    expect(typeof overview.statusSummary.delayed).toBe("number");
    expect(typeof overview.statusSummary.deprioritised).toBe("number");
  });

  it("should have correct due day distribution structure", async () => {
    const weekNumber = 12;
    const year = 2026;
    
    const overview = await db.getDashboardWeeklyOverview(weekNumber, year);
    
    // Verify all days of the week are present
    const expectedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    expectedDays.forEach(day => {
      expect(overview.dueDayDistribution).toHaveProperty(day);
      expect(typeof overview.dueDayDistribution[day]).toBe("number");
    });
  });

  it("should return empty arrays when no activities exist", async () => {
    const weekNumber = 99; // Unlikely to have activities
    const year = 2026;
    
    const overview = await db.getDashboardWeeklyOverview(weekNumber, year);
    
    // Should return valid structure even with no data
    expect(Array.isArray(overview.activities)).toBe(true);
    expect(Array.isArray(overview.priorityActivities)).toBe(true);
    expect(overview.totalActivities).toBe(0);
  });

  it("should count status correctly", async () => {
    const weekNumber = 12;
    const year = 2026;
    
    const overview = await db.getDashboardWeeklyOverview(weekNumber, year);
    
    // Total of all statuses should equal total activities
    const totalByStatus = 
      overview.statusSummary.pending + 
      overview.statusSummary.done + 
      overview.statusSummary.delayed + 
      overview.statusSummary.deprioritised;
    
    expect(totalByStatus).toBe(overview.totalActivities);
  });

  it("should only include priority activities that are not done or deprioritised", async () => {
    const weekNumber = 12;
    const year = 2026;
    
    const overview = await db.getDashboardWeeklyOverview(weekNumber, year);
    
    // All priority activities should have isPriority = true
    // and status should not be 'done' or 'deprioritised'
    overview.priorityActivities.forEach((item: any) => {
      expect(item.weeklyActivities.isPriority).toBe(true);
      expect(['pending', 'delayed']).toContain(item.weeklyActivities.status);
    });
  });

  it("should have user information in activities", async () => {
    const weekNumber = 12;
    const year = 2026;
    
    const overview = await db.getDashboardWeeklyOverview(weekNumber, year);
    
    // If there are activities, they should have user info
    if (overview.activities.length > 0) {
      overview.activities.forEach((item: any) => {
        expect(item.users).toBeDefined();
        expect(item.users.name).toBeDefined();
        expect(item.weeklyActivities).toBeDefined();
        expect(item.weeklyActivities.activity).toBeDefined();
      });
    }
  });
});
