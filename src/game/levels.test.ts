import { describe, expect, it } from "vitest";
import { LEVELS, getLevel, resolveLevelProgress } from "./levels";

describe("LEVELS", () => {
  it("starts with a clean keeper-only penalty level", () => {
    const first = getLevel(0);

    expect(first.name).toBe("Opening Shot");
    expect(first.defenders).toEqual([]);
    expect(first.attempts).toBe(5);
    expect(first.requiredGoals).toBe(3);
  });

  it("introduces extra defending players after the first level", () => {
    const defenderCounts = LEVELS.map((level) => level.defenders.length);

    expect(defenderCounts[0]).toBe(0);
    expect(Math.max(...defenderCounts.slice(1))).toBeGreaterThanOrEqual(3);
  });

  it("clamps requested level indexes into the available campaign", () => {
    expect(getLevel(-99)).toBe(LEVELS[0]);
    expect(getLevel(999)).toBe(LEVELS[LEVELS.length - 1]);
  });
});

describe("resolveLevelProgress", () => {
  it("advances when the player reaches the required goals", () => {
    expect(resolveLevelProgress({ levelIndex: 0, score: 3, attempts: 5 })).toEqual({
      levelIndex: 1,
      completed: true,
      campaignComplete: false
    });
  });

  it("keeps the player on the same level after a failed set", () => {
    expect(resolveLevelProgress({ levelIndex: 2, score: 1, attempts: 5 })).toEqual({
      levelIndex: 2,
      completed: false,
      campaignComplete: false
    });
  });

  it("marks the campaign complete after the final level is passed", () => {
    const finalIndex = LEVELS.length - 1;

    expect(resolveLevelProgress({ levelIndex: finalIndex, score: 5, attempts: 5 })).toEqual({
      levelIndex: finalIndex,
      completed: true,
      campaignComplete: true
    });
  });
});
