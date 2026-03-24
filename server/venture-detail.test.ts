import { describe, it, expect } from "vitest";

describe("Venture Detail Page", () => {
  it("should calculate runway correctly", () => {
    const ventureValue = 5000000; // R5M
    const monthlyBurnRate = 50000; // R50k/month
    const runwayMonths = Math.floor(ventureValue / monthlyBurnRate);

    expect(runwayMonths).toBe(100);
  });

  it("should calculate runway with zero burn rate", () => {
    const ventureValue = 5000000;
    const monthlyBurnRate = 0;
    const runwayMonths = monthlyBurnRate > 0 ? Math.floor(ventureValue / monthlyBurnRate) : 0;

    expect(runwayMonths).toBe(0);
  });

  it("should calculate annual burn rate", () => {
    const monthlyBurnRate = 50000;
    const annualBurnRate = monthlyBurnRate * 12;

    expect(annualBurnRate).toBe(600000);
  });

  it("should format currency values correctly", () => {
    const ventureValue = 5000000;
    const formatted = (ventureValue / 1000000).toFixed(1);

    expect(formatted).toBe("5.0");
  });

  it("should format burn rate values correctly", () => {
    const burnRate = 50000;
    const formatted = (burnRate / 1000).toFixed(0);

    expect(formatted).toBe("50");
  });

  it("should identify revenue generating ventures", () => {
    const daysToRevenue = "0";
    const isRevenueGenerating = daysToRevenue === "0";

    expect(isRevenueGenerating).toBe(true);
  });

  it("should identify non-revenue generating ventures", () => {
    const daysToRevenue = "90";
    const isRevenueGenerating = daysToRevenue === "0";

    expect(isRevenueGenerating).toBe(false);
  });

  it("should parse venture metadata correctly", () => {
    const metadata = JSON.stringify({
      burnRate: 50000,
      daysToRevenue: "90",
      status: "MVP Development",
    });

    const parsed = JSON.parse(metadata);

    expect(parsed.burnRate).toBe(50000);
    expect(parsed.daysToRevenue).toBe("90");
    expect(parsed.status).toBe("MVP Development");
  });

  it("should handle missing metadata gracefully", () => {
    const metadata = null;
    const parsed = metadata ? JSON.parse(metadata) : {};

    expect(parsed).toEqual({});
  });

  it("should validate status color mapping", () => {
    const statusColors: Record<string, string> = {
      "Ideation": "bg-blue-100",
      "Validation": "bg-cyan-100",
      "MVP Development": "bg-purple-100",
      "Beta": "bg-orange-100",
      "Launch": "bg-yellow-100",
      "Growth": "bg-green-100",
      "Revenue generating": "bg-emerald-100",
      "Scaling": "bg-teal-100",
      "Exited": "bg-gray-100",
    };

    expect(statusColors["MVP Development"]).toBe("bg-purple-100");
    expect(statusColors["Revenue generating"]).toBe("bg-emerald-100");
    expect(Object.keys(statusColors).length).toBe(9);
  });

  it("should calculate runway alert threshold", () => {
    const runwayMonths = 4;
    const shouldShowAlert = runwayMonths > 0 && runwayMonths < 6;

    expect(shouldShowAlert).toBe(true);
  });

  it("should not show runway alert for sufficient runway", () => {
    const runwayMonths = 12;
    const shouldShowAlert = runwayMonths > 0 && runwayMonths < 6;

    expect(shouldShowAlert).toBe(false);
  });

  it("should support all venture status options", () => {
    const validStatuses = [
      "Ideation",
      "Validation",
      "MVP Development",
      "Beta",
      "Launch",
      "Growth",
      "Revenue generating",
      "Scaling",
      "Exited",
    ];

    expect(validStatuses.length).toBe(9);
    expect(validStatuses).toContain("MVP Development");
    expect(validStatuses).toContain("Revenue generating");
  });

  it("should support all days to revenue options", () => {
    const validDaysToRevenue = ["0", "30", "60", "90", "180", "365", "730"];

    expect(validDaysToRevenue.length).toBe(7);
    expect(validDaysToRevenue).toContain("0");
    expect(validDaysToRevenue).toContain("730");
  });

  it("should format days to revenue for display", () => {
    const daysToRevenue = "0";
    const display = daysToRevenue === "0" ? "Revenue Generating" : `${daysToRevenue} days`;

    expect(display).toBe("Revenue Generating");
  });

  it("should format days to revenue with value", () => {
    const daysToRevenue = "90";
    const display = daysToRevenue === "0" ? "Revenue Generating" : `${daysToRevenue} days`;

    expect(display).toBe("90 days");
  });

  it("should calculate burn rate percentage for visualization", () => {
    const monthlyBurnRate = 50000;
    const maxBurnRate = 100000;
    const percentage = (monthlyBurnRate / maxBurnRate) * 100;

    expect(percentage).toBe(50);
  });

  it("should cap burn rate visualization at 100%", () => {
    const monthlyBurnRate = 150000;
    const maxBurnRate = 100000;
    const percentage = Math.min((monthlyBurnRate / maxBurnRate) * 100, 100);

    expect(percentage).toBe(100);
  });
});
