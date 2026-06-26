export type DefenderConfig = {
  id: string;
  x: number;
  z: number;
  width: number;
  height: number;
  jump: number;
};

export type LevelConfig = {
  id: string;
  name: string;
  keeperDifficulty: number;
  attempts: number;
  requiredGoals: number;
  defenders: DefenderConfig[];
};

export type LevelProgressInput = {
  levelIndex: number;
  score: number;
  attempts: number;
};

export type LevelProgress = {
  levelIndex: number;
  completed: boolean;
  campaignComplete: boolean;
};

export const LEVELS: LevelConfig[] = [
  {
    id: "opening-shot",
    name: "Opening Shot",
    keeperDifficulty: 0.36,
    attempts: 5,
    requiredGoals: 3,
    defenders: []
  },
  {
    id: "split-wall",
    name: "Split Wall",
    keeperDifficulty: 0.46,
    attempts: 5,
    requiredGoals: 3,
    defenders: [
      { id: "left-gap", x: -1.05, z: -6.8, width: 0.72, height: 1.74, jump: 0.12 },
      { id: "right-gap", x: 1.05, z: -6.8, width: 0.72, height: 1.74, jump: 0.12 }
    ]
  },
  {
    id: "three-body-wall",
    name: "Three-Body Wall",
    keeperDifficulty: 0.56,
    attempts: 5,
    requiredGoals: 3,
    defenders: [
      { id: "wall-left", x: -1.18, z: -6.35, width: 0.68, height: 1.78, jump: 0.18 },
      { id: "wall-center", x: 0, z: -6.35, width: 0.68, height: 1.82, jump: 0.24 },
      { id: "wall-right", x: 1.18, z: -6.35, width: 0.68, height: 1.78, jump: 0.18 }
    ]
  },
  {
    id: "late-blockers",
    name: "Late Blockers",
    keeperDifficulty: 0.66,
    attempts: 5,
    requiredGoals: 4,
    defenders: [
      { id: "front-left", x: -1.65, z: -5.4, width: 0.72, height: 1.72, jump: 0.12 },
      { id: "front-right", x: 1.65, z: -5.4, width: 0.72, height: 1.72, jump: 0.12 },
      { id: "back-center", x: 0, z: -7.2, width: 0.72, height: 1.88, jump: 0.28 }
    ]
  },
  {
    id: "final-wall",
    name: "Final Wall",
    keeperDifficulty: 0.76,
    attempts: 5,
    requiredGoals: 4,
    defenders: [
      { id: "final-left", x: -1.8, z: -6.15, width: 0.7, height: 1.78, jump: 0.18 },
      { id: "final-mid-left", x: -0.62, z: -6.15, width: 0.7, height: 1.82, jump: 0.26 },
      { id: "final-mid-right", x: 0.62, z: -6.15, width: 0.7, height: 1.82, jump: 0.26 },
      { id: "final-right", x: 1.8, z: -6.15, width: 0.7, height: 1.78, jump: 0.18 }
    ]
  }
];

function clampIndex(index: number) {
  return Math.min(LEVELS.length - 1, Math.max(0, index));
}

export function getLevel(index: number): LevelConfig {
  return LEVELS[clampIndex(index)];
}

export function resolveLevelProgress({ levelIndex, score, attempts }: LevelProgressInput): LevelProgress {
  const safeIndex = clampIndex(levelIndex);
  const level = getLevel(safeIndex);
  const completed = attempts >= level.attempts && score >= level.requiredGoals;
  const campaignComplete = completed && safeIndex === LEVELS.length - 1;

  return {
    levelIndex: completed && !campaignComplete ? safeIndex + 1 : safeIndex,
    completed,
    campaignComplete
  };
}
