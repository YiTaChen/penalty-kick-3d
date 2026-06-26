import { chooseKeeperAction, type KeeperProfile } from "../domain/keeper";
import { evaluatePenalty, type KeeperAction, type PenaltyOutcome } from "../domain/result";
import { createShot, type Shot, type ShotInput } from "../domain/shot";

export type RoundTally = {
  score: number;
  attempts: number;
};

export type PenaltyRound = RoundTally & {
  shot: Shot;
  keeper: KeeperAction;
  outcome: PenaltyOutcome;
};

export function resolvePenaltyRound(
  aim: ShotInput,
  keeperProfile: KeeperProfile,
  random: () => number = Math.random,
  previous: RoundTally = { score: 0, attempts: 0 }
): PenaltyRound {
  const shot = createShot(aim);
  const keeper = chooseKeeperAction(shot, keeperProfile, random);
  const outcome = evaluatePenalty(shot, keeper);

  return {
    shot,
    keeper,
    outcome,
    score: previous.score + (outcome.type === "goal" ? 1 : 0),
    attempts: previous.attempts + 1
  };
}
