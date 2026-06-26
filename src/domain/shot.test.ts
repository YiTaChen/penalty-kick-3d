import { describe, expect, it } from "vitest";
import { GOAL, createShot, simulateShotPosition } from "./shot";

describe("createShot", () => {
  it("turns stronger power into a faster shot", () => {
    const placed = createShot({ targetX: 0, targetY: 1.2, power: 0.35, curve: 0 });
    const driven = createShot({ targetX: 0, targetY: 1.2, power: 0.9, curve: 0 });

    expect(driven.speed).toBeGreaterThan(placed.speed);
    expect(Math.abs(driven.velocity.z)).toBeGreaterThan(Math.abs(placed.velocity.z));
    expect(driven.travelTime).toBeLessThan(placed.travelTime);
  });

  it("aims upper-left with leftward and upward launch velocity", () => {
    const shot = createShot({
      targetX: -GOAL.width / 2 + 0.35,
      targetY: GOAL.height - 0.25,
      power: 0.72,
      curve: 0
    });

    expect(shot.velocity.x).toBeLessThan(0);
    expect(shot.velocity.y).toBeGreaterThan(0);
    expect(shot.target.x).toBeCloseTo(-GOAL.width / 2 + 0.35, 4);
    expect(shot.target.y).toBeCloseTo(GOAL.height - 0.25, 4);
  });

  it("clamps wild input to playable shot limits", () => {
    const shot = createShot({ targetX: 99, targetY: -4, power: 7, curve: -5 });

    expect(shot.target.x).toBe(GOAL.width / 2 + GOAL.margin);
    expect(shot.target.y).toBe(GOAL.minShotHeight);
    expect(shot.power).toBe(1);
    expect(shot.curve).toBe(-1);
  });
});

describe("simulateShotPosition", () => {
  it("starts at the ball and reaches the intended goal plane height", () => {
    const shot = createShot({ targetX: 1.4, targetY: 1.7, power: 0.6, curve: 0 });

    expect(simulateShotPosition(shot, 0)).toEqual(shot.start);

    const atGoal = simulateShotPosition(shot, shot.travelTime);

    expect(atGoal.z).toBeCloseTo(GOAL.planeZ, 4);
    expect(atGoal.x).toBeCloseTo(1.4, 4);
    expect(atGoal.y).toBeCloseTo(1.7, 4);
  });

  it("bends the ball horizontally when curve is applied", () => {
    const straight = createShot({ targetX: 0, targetY: 1.2, power: 0.6, curve: 0 });
    const curved = createShot({ targetX: 0, targetY: 1.2, power: 0.6, curve: 0.8 });

    const halfwayStraight = simulateShotPosition(straight, straight.travelTime / 2);
    const halfwayCurved = simulateShotPosition(curved, curved.travelTime / 2);

    expect(halfwayCurved.x).toBeGreaterThan(halfwayStraight.x);
  });
});
