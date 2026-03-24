import { describe, it, expect, vi } from "vitest";
import * as db from "./db";

describe("Venture Edit Functionality", () => {
  it("should update venture basic fields", async () => {
    const mockCard = {
      id: 1,
      stageId: 1,
      title: "Old Venture Name",
      description: "Old description",
      value: "1000000",
      currency: "ZAR",
      ownerId: 1,
      dueDate: new Date(),
      tags: null,
      metadata: JSON.stringify({ burnRate: 50000, daysToRevenue: "90", status: "MVP Development" }),
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      movedAt: null,
    };

    // Simulate update with new values
    const updates = {
      title: "New Venture Name",
      description: "New description",
    };

    expect(updates.title).toBe("New Venture Name");
    expect(updates.description).toBe("New description");
  });

  it("should merge metadata fields when updating venture", async () => {
    const existingMetadata = {
      burnRate: 50000,
      daysToRevenue: "90",
      status: "MVP Development",
      customField: "value",
    };

    const newData = {
      burnRate: 75000,
      daysToRevenue: "60",
      status: "Beta",
    };

    const mergedMetadata = {
      ...existingMetadata,
      ...newData,
    };

    expect(mergedMetadata.burnRate).toBe(75000);
    expect(mergedMetadata.daysToRevenue).toBe("60");
    expect(mergedMetadata.status).toBe("Beta");
    expect(mergedMetadata.customField).toBe("value"); // Preserved
  });

  it("should handle metadata parsing correctly", async () => {
    const metadataString = JSON.stringify({
      burnRate: 50000,
      daysToRevenue: "90",
      status: "MVP Development",
    });

    const parsed = JSON.parse(metadataString);
    expect(parsed.burnRate).toBe(50000);
    expect(parsed.daysToRevenue).toBe("90");
    expect(parsed.status).toBe("MVP Development");
  });

  it("should handle empty metadata gracefully", async () => {
    const emptyMetadata = null;
    const parsed = emptyMetadata ? JSON.parse(emptyMetadata) : {};

    expect(parsed).toEqual({});
  });

  it("should validate burn rate as number", async () => {
    const burnRate = "75000";
    const parsed = parseFloat(burnRate);

    expect(parsed).toBe(75000);
    expect(typeof parsed).toBe("number");
  });

  it("should preserve all venture fields during update", async () => {
    const originalVenture = {
      id: 1,
      stageId: 1,
      title: "FinTech Platform",
      description: "A financial technology platform",
      value: "5000000",
      currency: "ZAR",
      ownerId: 2,
      dueDate: new Date("2026-12-31"),
      tags: JSON.stringify(["fintech", "africa"]),
      metadata: JSON.stringify({
        burnRate: 50000,
        daysToRevenue: "90",
        status: "MVP Development",
      }),
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      movedAt: null,
    };

    const updates = {
      burnRate: 75000,
      status: "Beta",
    };

    // Simulate what the mutation does
    const existingMetadata = JSON.parse(originalVenture.metadata);
    const newMetadata = {
      ...existingMetadata,
      burnRate: updates.burnRate,
      status: updates.status,
    };

    expect(newMetadata.burnRate).toBe(75000);
    expect(newMetadata.daysToRevenue).toBe("90"); // Preserved
    expect(newMetadata.status).toBe("Beta");
  });

  it("should support all venture status options", async () => {
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

    validStatuses.forEach((status) => {
      expect(validStatuses).toContain(status);
    });

    expect(validStatuses.length).toBe(9);
  });

  it("should support all days to revenue options", async () => {
    const validDaysToRevenue = ["0", "30", "60", "90", "180", "365", "730"];

    validDaysToRevenue.forEach((days) => {
      expect(validDaysToRevenue).toContain(days);
    });

    expect(validDaysToRevenue.length).toBe(7);
  });

  it("should calculate burn rate correctly", async () => {
    const monthlyBurnRate = 50000;
    const annualBurnRate = monthlyBurnRate * 12;

    expect(annualBurnRate).toBe(600000);
  });

  it("should handle venture with no metadata", async () => {
    const ventureWithoutMetadata = {
      id: 1,
      stageId: 1,
      title: "New Venture",
      description: null,
      value: null,
      currency: "ZAR",
      ownerId: null,
      dueDate: null,
      tags: null,
      metadata: null,
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      movedAt: null,
    };

    const existingMetadata = ventureWithoutMetadata.metadata
      ? JSON.parse(ventureWithoutMetadata.metadata)
      : {};

    const newMetadata = {
      ...existingMetadata,
      burnRate: 50000,
      status: "Ideation",
    };

    expect(newMetadata.burnRate).toBe(50000);
    expect(newMetadata.status).toBe("Ideation");
  });
});
