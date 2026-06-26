import { describe, expect, it } from "vitest";
import { createKeeperAction, evaluatePenalty } from "./result";
import { createShot } from "./shot";

describe("evaluatePenalty", () => {
  it("scores when the ball crosses inside the frame and away from the keeper", () => {
    const shot = createShot({ targetX: -2.2, targetY: 1.9, power: 0.82, curve: 0 });
    const standingKeeper = createKeeperAction({
      centerX: 0,
      centerY: 1.15,
      reachX: 0.45,
      reachY: 0.55,
      reactionDelay: 0.4
    });

    expect(evaluatePenalty(shot, standingKeeper).type).toBe("goal");
  });

  it("misses when the shot finishes outside the posts", () => {
    const shot = createShot({ targetX: 4.4, targetY: 1.2, power: 0.7, curve: 0 });

    expect(evaluatePenalty(shot).type).toBe("miss");
  });

  it("marks woodwork near the posts or crossbar", () => {
    const post = createShot({ targetX: 3.66, targetY: 1.2, power: 0.7, curve: 0 });
    const crossbar = createShot({ targetX: 0.4, targetY: 2.44, power: 0.7, curve: 0 });

    expect(evaluatePenalty(post).type).toBe("woodwork");
    expect(evaluatePenalty(crossbar).type).toBe("woodwork");
  });

  it("is saved when the keeper covers the shot at the goal plane", () => {
    const shot = createShot({ targetX: 0.45, targetY: 1.35, power: 0.62, curve: 0 });
    const action = createKeeperAction({
      centerX: 0.5,
      centerY: 1.25,
      reachX: 0.8,
      reachY: 0.65,
      reactionDelay: 0.2
    });

    expect(evaluatePenalty(shot, action).type).toBe("saved");
  });

  it("is blocked when the ball path intersects a defender before the goal", () => {
    const shot = createShot({ targetX: 0, targetY: 1.2, power: 0.72, curve: 0 });

    expect(
      evaluatePenalty(shot, undefined, [
        { id: "central-wall", x: 0, z: -6, width: 0.8, height: 1.8, jump: 0 }
      ])
    ).toMatchObject({
      type: "blocked",
      defenderId: "central-wall"
    });
  });

  it("does not block a shot that passes outside a defender body", () => {
    const shot = createShot({ targetX: 2.6, targetY: 1.55, power: 0.78, curve: 0 });

    expect(
      evaluatePenalty(shot, undefined, [
        { id: "central-wall", x: 0, z: -6, width: 0.62, height: 1.8, jump: 0 }
      ]).type
    ).not.toBe("blocked");
  });

  it("reports the first defender hit along the flight path", () => {
    const shot = createShot({ targetX: 0, targetY: 1.1, power: 0.7, curve: 0 });

    expect(
      evaluatePenalty(shot, undefined, [
        { id: "back-wall", x: 0, z: -7, width: 0.8, height: 1.8, jump: 0 },
        { id: "front-wall", x: 0, z: -4.5, width: 0.8, height: 1.8, jump: 0 }
      ])
    ).toMatchObject({
      type: "blocked",
      defenderId: "front-wall"
    });
  });
});
