import { type Shot, GOAL } from "./shot";
import { createKeeperAction, type KeeperAction } from "./result";

export type KeeperProfile = {
  difficulty: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

export function chooseKeeperAction(
  shot: Shot,
  profile: KeeperProfile,
  random: () => number = Math.random
): KeeperAction {
  const difficulty = clamp(profile.difficulty, 0, 1);
  const tracking = lerp(0.35, 0.96, difficulty);
  const noise = lerp(2.35, 0.18, difficulty);
  const centerX = lerp(0, shot.target.x, tracking) + (random() - 0.5) * 2 * noise;
  const centerY = lerp(1.05, shot.target.y, tracking) + (random() - 0.5) * 2 * noise * 0.35;

  return createKeeperAction({
    centerX: clamp(centerX, -3.2, 3.2),
    centerY: clamp(centerY, 0.55, Math.min(2.15, GOAL.height - 0.08)),
    reachX: lerp(0.58, 1.2, difficulty),
    reachY: lerp(0.52, 0.92, difficulty),
    reactionDelay: lerp(0.62, 0.18, difficulty)
  });
}
