import { GOAL, type Shot, type Vector3, simulateShotPosition } from "./shot";

export type PenaltyOutcomeType = "goal" | "saved" | "miss" | "woodwork";

export type KeeperAction = {
  centerX: number;
  centerY: number;
  reachX: number;
  reachY: number;
  reactionDelay: number;
};

export type PenaltyOutcome = {
  type: PenaltyOutcomeType;
  impact: Vector3;
};

const WOODWORK_TOLERANCE = 0.13;

export function createKeeperAction(action: KeeperAction): KeeperAction {
  return {
    centerX: action.centerX,
    centerY: action.centerY,
    reachX: action.reachX,
    reachY: action.reachY,
    reactionDelay: action.reactionDelay
  };
}

export function evaluatePenalty(shot: Shot, keeper?: KeeperAction): PenaltyOutcome {
  const impact = simulateShotPosition(shot, shot.travelTime);

  if (hitsWoodwork(impact)) {
    return { type: "woodwork", impact };
  }

  if (!isInsideGoalFrame(impact)) {
    return { type: "miss", impact };
  }

  if (keeper && keeperCoversImpact(keeper, impact)) {
    return { type: "saved", impact };
  }

  return { type: "goal", impact };
}

function hitsWoodwork(impact: Vector3) {
  const nearPost = Math.abs(Math.abs(impact.x) - GOAL.width / 2) <= WOODWORK_TOLERANCE;
  const nearCrossbar = Math.abs(impact.y - GOAL.height) <= WOODWORK_TOLERANCE;
  const withinPostHeight = impact.y >= 0 && impact.y <= GOAL.height + WOODWORK_TOLERANCE;
  const withinCrossbarWidth = Math.abs(impact.x) <= GOAL.width / 2 + WOODWORK_TOLERANCE;

  return (nearPost && withinPostHeight) || (nearCrossbar && withinCrossbarWidth);
}

function isInsideGoalFrame(impact: Vector3) {
  return Math.abs(impact.x) < GOAL.width / 2 && impact.y > 0 && impact.y < GOAL.height;
}

function keeperCoversImpact(keeper: KeeperAction, impact: Vector3) {
  const horizontal = Math.abs(impact.x - keeper.centerX) / keeper.reachX;
  const vertical = Math.abs(impact.y - keeper.centerY) / keeper.reachY;

  return horizontal ** 2 + vertical ** 2 <= 1;
}
