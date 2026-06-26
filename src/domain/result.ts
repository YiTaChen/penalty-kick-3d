import type { DefenderConfig } from "./defender";
import { GOAL, type Shot, type Vector3, simulateShotPosition } from "./shot";

export type PenaltyOutcomeType = "goal" | "saved" | "miss" | "woodwork" | "blocked";

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
  defenderId?: string;
};

const WOODWORK_TOLERANCE = 0.13;
const BALL_COLLISION_RADIUS = 0.13;

export function createKeeperAction(action: KeeperAction): KeeperAction {
  return {
    centerX: action.centerX,
    centerY: action.centerY,
    reachX: action.reachX,
    reachY: action.reachY,
    reactionDelay: action.reactionDelay
  };
}

export function evaluatePenalty(
  shot: Shot,
  keeper?: KeeperAction,
  defenders: DefenderConfig[] = []
): PenaltyOutcome {
  const defenderBlock = findDefenderBlock(shot, defenders);

  if (defenderBlock) {
    return {
      type: "blocked",
      impact: defenderBlock.position,
      defenderId: defenderBlock.defenderId
    };
  }

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

function findDefenderBlock(shot: Shot, defenders: DefenderConfig[]) {
  return defenders
    .map((defender) => {
      const timeAtDefender = (defender.z - shot.start.z) / shot.velocity.z;

      if (timeAtDefender <= 0 || timeAtDefender >= shot.travelTime) {
        return null;
      }

      const position = simulateShotPosition(shot, timeAtDefender);
      const horizontallyCovered = Math.abs(position.x - defender.x) <= defender.width / 2 + BALL_COLLISION_RADIUS;
      const verticallyCovered = position.y >= 0 && position.y <= defender.height + defender.jump + BALL_COLLISION_RADIUS;

      if (!horizontallyCovered || !verticallyCovered) {
        return null;
      }

      return {
        defenderId: defender.id,
        position,
        timeAtDefender
      };
    })
    .filter((block): block is NonNullable<typeof block> => block !== null)
    .sort((left, right) => left.timeAtDefender - right.timeAtDefender)[0];
}
