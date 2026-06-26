import { describe, expect, it } from "vitest";
import { resolvePenaltyRound } from "./penaltyGame";

describe("resolvePenaltyRound", () => {
  it("creates a deterministic round result from aim and difficulty", () => {
    const round = resolvePenaltyRound(
      { targetX: -2.4, targetY: 2, power: 0.86, curve: 0 },
      { difficulty: 0.2 },
      () => 0.95
    );

    expect(round.shot.target.x).toBeCloseTo(-2.4, 4);
    expect(round.keeper.centerX).toBeGreaterThan(-1.6);
    expect(round.outcome.type).toBe("goal");
  });

  it("increments score only when the outcome is a goal", () => {
    const scored = resolvePenaltyRound(
      { targetX: -2.4, targetY: 2, power: 0.86, curve: 0 },
      { difficulty: 0.2 },
      () => 0.95,
      { score: 2, attempts: 4 }
    );
    const saved = resolvePenaltyRound(
      { targetX: 0.1, targetY: 1.15, power: 0.5, curve: 0 },
      { difficulty: 1 },
      () => 0.5,
      { score: 2, attempts: 4 }
    );

    expect(scored.score).toBe(3);
    expect(saved.score).toBe(2);
    expect(scored.attempts).toBe(5);
    expect(saved.attempts).toBe(5);
  });

  it("uses level defenders when resolving a round outcome", () => {
    const round = resolvePenaltyRound(
      { targetX: 0, targetY: 1.2, power: 0.72, curve: 0 },
      { difficulty: 0 },
      () => 0.9,
      { score: 1, attempts: 2 },
      [{ id: "central-wall", x: 0, z: -6, width: 0.8, height: 1.8, jump: 0 }]
    );

    expect(round.outcome).toMatchObject({
      type: "blocked",
      defenderId: "central-wall"
    });
    expect(round.score).toBe(1);
    expect(round.attempts).toBe(3);
  });
});
