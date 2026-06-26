export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export type ShotInput = {
  targetX: number;
  targetY: number;
  power: number;
  curve: number;
};

export type Shot = {
  start: Vector3;
  target: { x: number; y: number };
  velocity: Vector3;
  power: number;
  curve: number;
  speed: number;
  travelTime: number;
};

export const GOAL = {
  width: 7.32,
  height: 2.44,
  planeZ: -11,
  margin: 0.55,
  minShotHeight: 0.12
} as const;

const BALL_RADIUS = 0.11;
const GRAVITY = 9.81;
const MIN_SPEED = 18;
const MAX_SPEED = 34;
const MAX_CURVE_OFFSET = 0.72;

const BALL_START: Vector3 = {
  x: 0,
  y: BALL_RADIUS,
  z: 0
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

export function createShot(input: ShotInput): Shot {
  const power = clamp(input.power, 0, 1);
  const curve = clamp(input.curve, -1, 1);
  const target = {
    x: clamp(input.targetX, -(GOAL.width / 2 + GOAL.margin), GOAL.width / 2 + GOAL.margin),
    y: clamp(input.targetY, GOAL.minShotHeight, GOAL.height + GOAL.margin)
  };

  const speed = lerp(MIN_SPEED, MAX_SPEED, power);
  const horizontalDistance = Math.hypot(target.x - BALL_START.x, GOAL.planeZ - BALL_START.z);
  const travelTime = horizontalDistance / speed;

  return {
    start: BALL_START,
    target,
    velocity: {
      x: (target.x - BALL_START.x) / travelTime,
      y: (target.y - BALL_START.y + 0.5 * GRAVITY * travelTime ** 2) / travelTime,
      z: (GOAL.planeZ - BALL_START.z) / travelTime
    },
    power,
    curve,
    speed,
    travelTime
  };
}

export function simulateShotPosition(shot: Shot, time: number): Vector3 {
  const t = clamp(time, 0, shot.travelTime);
  const progress = shot.travelTime === 0 ? 0 : t / shot.travelTime;
  const curveOffset = shot.curve * MAX_CURVE_OFFSET * 4 * progress * (1 - progress);

  return {
    x: shot.start.x + shot.velocity.x * t + curveOffset,
    y: shot.start.y + shot.velocity.y * t - 0.5 * GRAVITY * t ** 2,
    z: shot.start.z + shot.velocity.z * t
  };
}
