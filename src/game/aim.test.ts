import { describe, expect, it } from "vitest";
import { createAimFromDrag } from "./aim";

describe("createAimFromDrag", () => {
  it("maps an upward-right drag to the upper-right side of goal", () => {
    const aim = createAimFromDrag({ deltaX: 120, deltaY: -150 });

    expect(aim.targetX).toBeGreaterThan(0);
    expect(aim.targetY).toBeGreaterThan(1.7);
    expect(aim.power).toBeGreaterThan(0.6);
    expect(aim.curve).toBeGreaterThan(0);
  });

  it("clamps long gestures into playable aim values", () => {
    const aim = createAimFromDrag({ deltaX: -999, deltaY: 999 });

    expect(aim.targetX).toBeGreaterThanOrEqual(-3.66);
    expect(aim.targetY).toBeGreaterThanOrEqual(0.25);
    expect(aim.power).toBeLessThanOrEqual(1);
    expect(aim.curve).toBe(-1);
  });
});
