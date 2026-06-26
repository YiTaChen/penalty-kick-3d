import { GOAL, type ShotInput } from "../domain/shot";

export type DragInput = {
  deltaX: number;
  deltaY: number;
};

const MAX_DRAG = 260;
const HORIZONTAL_AIM_PIXELS = 180;
const VERTICAL_AIM_PIXELS = 170;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function createAimFromDrag({ deltaX, deltaY }: DragInput): ShotInput {
  const dragDistance = Math.hypot(deltaX, deltaY);
  const targetX = clamp(
    (deltaX / HORIZONTAL_AIM_PIXELS) * (GOAL.width / 2),
    -GOAL.width / 2,
    GOAL.width / 2
  );
  const targetY = clamp(1.05 + (-deltaY / VERTICAL_AIM_PIXELS) * 1.35, 0.25, GOAL.height - 0.12);

  return {
    targetX,
    targetY,
    power: clamp(dragDistance / MAX_DRAG, 0.18, 1),
    curve: clamp(deltaX / 220, -1, 1)
  };
}
