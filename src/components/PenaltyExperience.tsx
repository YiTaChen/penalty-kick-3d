import { RotateCcw, Target, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { evaluatePenalty, type KeeperAction, type PenaltyOutcome } from "../domain/result";
import { createShot, type Shot, type ShotInput } from "../domain/shot";
import { createAimFromDrag } from "../game/aim";
import { resolvePenaltyRound } from "../game/penaltyGame";
import { PenaltySceneCanvas } from "./PenaltySceneCanvas";

type Phase = "ready" | "aiming" | "flying" | "result";

type PointerPoint = {
  x: number;
  y: number;
};

const DEFAULT_AIM: ShotInput = {
  targetX: 0,
  targetY: 1.2,
  power: 0.46,
  curve: 0
};

const OUTCOME_LABEL: Record<PenaltyOutcome["type"], string> = {
  goal: "GOAL",
  saved: "SAVED",
  miss: "MISS",
  woodwork: "POST",
  blocked: "BLOCKED"
};

export function PenaltyExperience() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [difficulty, setDifficulty] = useState(0.42);
  const [dragStart, setDragStart] = useState<PointerPoint | null>(null);
  const [dragCurrent, setDragCurrent] = useState<PointerPoint | null>(null);
  const [aim, setAim] = useState<ShotInput>(DEFAULT_AIM);
  const [shot, setShot] = useState<Shot | null>(null);
  const [keeper, setKeeper] = useState<KeeperAction | null>(null);
  const [outcome, setOutcome] = useState<PenaltyOutcome | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [launchTime, setLaunchTime] = useState<number | null>(null);

  const previewShot = useMemo(() => createShot(aim), [aim]);

  useEffect(() => {
    if (!shot || phase !== "flying") {
      return;
    }

    const resultTimer = window.setTimeout(
      () => setPhase("result"),
      Math.max(720, shot.travelTime * 1000 + 260)
    );

    return () => window.clearTimeout(resultTimer);
  }, [phase, shot]);

  function pointerToPoint(event: React.PointerEvent<HTMLElement>): PointerPoint {
    return { x: event.clientX, y: event.clientY };
  }

  function updateAimFromPointer(point: PointerPoint, origin = dragStart) {
    if (!origin) {
      return;
    }

    setAim(
      createAimFromDrag({
        deltaX: point.x - origin.x,
        deltaY: point.y - origin.y
      })
    );
  }

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    if (phase === "flying") {
      return;
    }

    const point = pointerToPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    setPhase("aiming");
    setDragStart(point);
    setDragCurrent(point);
    setShot(null);
    setKeeper(null);
    setOutcome(null);
    setLaunchTime(null);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!dragStart || phase !== "aiming") {
      return;
    }

    const point = pointerToPoint(event);
    setDragCurrent(point);
    updateAimFromPointer(point);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLElement>) {
    if (!dragStart || phase !== "aiming") {
      return;
    }

    const point = pointerToPoint(event);
    event.currentTarget.releasePointerCapture(event.pointerId);
    const nextAim = createAimFromDrag({
      deltaX: point.x - dragStart.x,
      deltaY: point.y - dragStart.y
    });
    const round = resolvePenaltyRound(nextAim, { difficulty }, Math.random, { score, attempts });

    setAim(nextAim);
    setShot(round.shot);
    setKeeper(round.keeper);
    setOutcome(round.outcome);
    setScore(round.score);
    setAttempts(round.attempts);
    setLaunchTime(performance.now());
    setPhase("flying");
    setDragStart(null);
    setDragCurrent(null);
  }

  function resetRound() {
    setPhase("ready");
    setDragStart(null);
    setDragCurrent(null);
    setAim(DEFAULT_AIM);
    setShot(null);
    setKeeper(null);
    setOutcome(null);
    setLaunchTime(null);
  }

  const visibleOutcome = outcome && phase === "result" ? OUTCOME_LABEL[outcome.type] : null;
  const resolvedShot = shot ?? previewShot;
  const resolvedKeeper =
    keeper ??
    (phase === "aiming"
      ? {
          centerX: aim.targetX * 0.16,
          centerY: 1.16,
          reachX: 0.64,
          reachY: 0.58,
          reactionDelay: 0.4
        }
      : null);
  const liveOutcome = shot && keeper ? evaluatePenalty(shot, keeper) : null;

  return (
    <main
      className="game-shell"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={resetRound}
    >
      <PenaltySceneCanvas
        aim={aim}
        keeper={resolvedKeeper}
        launchTime={launchTime}
        outcome={liveOutcome}
        phase={phase}
        previewShot={previewShot}
        shot={phase === "flying" || phase === "result" ? resolvedShot : null}
      />

      <section className="top-hud" aria-label="match status">
        <div>
          <p className="eyebrow">Penalty Kick 3D</p>
          <h1>12 碼射門練習場</h1>
        </div>
        <div className="score-block" aria-label="score">
          <span>Score</span>
          <strong>{score} / {attempts}</strong>
        </div>
      </section>

      <section className="control-strip" aria-label="shot controls">
        <div className="meter" aria-label="shot power">
          <Zap size={18} aria-hidden="true" />
          <span style={{ "--value": aim.power } as React.CSSProperties} />
        </div>
        <div className="meter" aria-label="shot accuracy">
          <Target size={18} aria-hidden="true" />
          <span style={{ "--value": 1 - Math.abs(aim.curve) * 0.5 } as React.CSSProperties} />
        </div>
        <label className="difficulty-control">
          <span>Keeper</span>
          <input
            aria-label="Keeper difficulty"
            max="1"
            min="0"
            step="0.01"
            type="range"
            value={difficulty}
            onChange={(event) => setDifficulty(Number(event.target.value))}
            onPointerDown={(event) => event.stopPropagation()}
          />
        </label>
        <button
          aria-label="Reset round"
          className="icon-button"
          title="Reset round"
          type="button"
          onClick={resetRound}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <RotateCcw size={20} aria-hidden="true" />
        </button>
      </section>

      {dragStart && dragCurrent ? (
        <div
          aria-hidden="true"
          className="drag-reticle"
          style={{
            "--origin-x": `${dragStart.x}px`,
            "--origin-y": `${dragStart.y}px`,
            "--current-x": `${dragCurrent.x}px`,
            "--current-y": `${dragCurrent.y}px`
          } as React.CSSProperties}
        />
      ) : null}

      {visibleOutcome ? <div className={`result-flash ${outcome?.type}`}>{visibleOutcome}</div> : null}
    </main>
  );
}
