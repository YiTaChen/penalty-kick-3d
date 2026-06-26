import { describe, expect, it } from "vitest";
import { chooseKeeperAction } from "./keeper";
import { createShot } from "./shot";

describe("chooseKeeperAction", () => {
  it("tracks the shot more closely as difficulty rises", () => {
    const shot = createShot({ targetX: -2.6, targetY: 2.1, power: 0.8, curve: 0 });
    const low = chooseKeeperAction(shot, { difficulty: 0.1 }, () => 0.85);
    const high = chooseKeeperAction(shot, { difficulty: 0.95 }, () => 0.85);

    expect(Math.abs(high.centerX - shot.target.x)).toBeLessThan(
      Math.abs(low.centerX - shot.target.x)
    );
    expect(high.reactionDelay).toBeLessThan(low.reactionDelay);
  });

  it("keeps dive targets inside the goal mouth", () => {
    const shot = createShot({ targetX: 4.2, targetY: 3.4, power: 1, curve: 1 });
    const action = chooseKeeperAction(shot, { difficulty: 1 }, () => 0);

    expect(action.centerX).toBeLessThanOrEqual(3.2);
    expect(action.centerX).toBeGreaterThanOrEqual(-3.2);
    expect(action.centerY).toBeLessThanOrEqual(2.15);
    expect(action.centerY).toBeGreaterThanOrEqual(0.55);
  });
});
