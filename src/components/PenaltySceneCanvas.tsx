import { Line, PerspectiveCamera, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { DefenderConfig } from "../domain/defender";
import { GOAL, type Shot, type ShotInput, simulateShotPosition } from "../domain/shot";
import type { KeeperAction, PenaltyOutcome } from "../domain/result";

type SceneProps = {
  aim: ShotInput;
  defenders: DefenderConfig[];
  keeper: KeeperAction | null;
  launchTime: number | null;
  outcome: PenaltyOutcome | null;
  phase: "ready" | "aiming" | "flying" | "result";
  previewShot: Shot;
  shot: Shot | null;
};

export function PenaltySceneCanvas(props: SceneProps) {
  return (
    <Canvas className="scene-canvas" shadows dpr={[1, 1.75]}>
      <color attach="background" args={["#77a7c8"]} />
      <fog attach="fog" args={["#77a7c8", 14, 34]} />
      <PerspectiveCamera makeDefault position={[0, 3.2, 8.6]} fov={42} />
      <CameraRig />
      <ambientLight intensity={1.7} />
      <directionalLight castShadow intensity={2.6} position={[-4, 8, 5]} shadow-mapSize={[1024, 1024]} />
      <PenaltyScene {...props} />
    </Canvas>
  );
}

function CameraRig() {
  useFrame(({ camera }) => {
    camera.lookAt(0, 1.15, GOAL.planeZ + 1.6);
  });

  return null;
}

function PenaltyScene({ aim, defenders, keeper, launchTime, outcome, phase, previewShot, shot }: SceneProps) {
  return (
    <group>
      <Pitch />
      <Goal />
      <PenaltySpot />
      <Player aim={aim} phase={phase} />
      <DefenderWall defenders={defenders} phase={phase} />
      <Keeper action={keeper} phase={phase} />
      <Ball launchTime={launchTime} phase={phase} shot={shot} />
      {phase === "aiming" ? <AimPreview shot={previewShot} /> : null}
      {outcome && phase === "result" ? <OutcomeMarker outcome={outcome} /> : null}
    </group>
  );
}

function Pitch() {
  const stripeMaterials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: "#25854f", roughness: 0.95 }),
      new THREE.MeshStandardMaterial({ color: "#2f9a5b", roughness: 0.95 })
    ],
    []
  );

  return (
    <group>
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.01, -5.5]}>
        <planeGeometry args={[15, 26]} />
        <meshStandardMaterial color="#2a8c50" roughness={0.96} />
      </mesh>
      {Array.from({ length: 10 }, (_, index) => (
        <mesh
          key={index}
          receiveShadow
          material={stripeMaterials[index % 2]}
          position={[0, 0, 6 - index * 2.6]}
          rotation-x={-Math.PI / 2}
        >
          <planeGeometry args={[15, 2.6]} />
        </mesh>
      ))}
      <FieldLine position={[0, 0.012, GOAL.planeZ]} scale={[GOAL.width, 0.04, 1]} />
      <FieldLine position={[0, 0.012, 0]} scale={[0.18, 0.04, 1]} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.018, 0]}>
        <ringGeometry args={[1.05, 1.1, 48]} />
        <meshBasicMaterial color="#f8fafc" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function FieldLine({ position, scale }: { position: [number, number, number]; scale: [number, number, number] }) {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#f8fafc" transparent opacity={0.85} />
    </mesh>
  );
}

function Goal() {
  const postColor = "#f8fafc";
  const netColor = "#d7efff";

  return (
    <group position={[0, 0, GOAL.planeZ]}>
      <Post position={[-GOAL.width / 2, GOAL.height / 2, 0]} scale={[0.12, GOAL.height, 0.12]} />
      <Post position={[GOAL.width / 2, GOAL.height / 2, 0]} scale={[0.12, GOAL.height, 0.12]} />
      <Post position={[0, GOAL.height, 0]} scale={[GOAL.width + 0.12, 0.12, 0.12]} />
      <mesh receiveShadow position={[0, GOAL.height / 2, -0.9]}>
        <boxGeometry args={[GOAL.width, GOAL.height, 0.04]} />
        <meshStandardMaterial color={netColor} wireframe transparent opacity={0.34} />
      </mesh>
      {[-2.7, -1.8, -0.9, 0, 0.9, 1.8, 2.7].map((x) => (
        <mesh key={x} position={[x, GOAL.height / 2, -0.88]}>
          <boxGeometry args={[0.018, GOAL.height, 0.018]} />
          <meshBasicMaterial color={netColor} transparent opacity={0.4} />
        </mesh>
      ))}
      {[0.5, 1, 1.5, 2].map((y) => (
        <mesh key={y} position={[0, y, -0.86]}>
          <boxGeometry args={[GOAL.width, 0.018, 0.018]} />
          <meshBasicMaterial color={netColor} transparent opacity={0.36} />
        </mesh>
      ))}
      <mesh position={[0, GOAL.height + 0.22, 0.06]}>
        <boxGeometry args={[1.6, 0.28, 0.08]} />
        <meshStandardMaterial color="#111827" roughness={0.7} />
      </mesh>
      <Text color="#f9fafb" fontSize={0.16} position={[0, GOAL.height + 0.23, 0.11]}>
        12M
      </Text>
      <meshStandardMaterial color={postColor} />
    </group>
  );
}

function Post({ position, scale }: { position: [number, number, number]; scale: [number, number, number] }) {
  return (
    <mesh castShadow position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.45} />
    </mesh>
  );
}

function PenaltySpot() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]}>
      <circleGeometry args={[0.14, 32]} />
      <meshBasicMaterial color="#f8fafc" />
    </mesh>
  );
}

function Player({ aim, phase }: { aim: ShotInput; phase: SceneProps["phase"] }) {
  const lean = phase === "flying" || phase === "result" ? -0.22 : 0;
  const legSwing = phase === "flying" || phase === "result" ? -0.9 : -0.2 - aim.power * 0.22;

  return (
    <group position={[-0.65, 0, 1.05]} rotation-z={lean}>
      <CharacterBody shirt="#dc2626" shorts="#f8fafc" />
      <mesh castShadow position={[0.24, 0.48, -0.02]} rotation-x={legSwing}>
        <boxGeometry args={[0.14, 0.75, 0.14]} />
        <meshStandardMaterial color="#111827" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.2, 0.46, 0.02]} rotation-x={0.18}>
        <boxGeometry args={[0.14, 0.72, 0.14]} />
        <meshStandardMaterial color="#111827" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Keeper({ action, phase }: { action: KeeperAction | null; phase: SceneProps["phase"] }) {
  const targetX = action ? action.centerX : 0;
  const targetY = action ? action.centerY : 1.1;
  const diveTilt = action && (phase === "flying" || phase === "result") ? -targetX * 0.16 : 0;

  return (
    <group position={[targetX, Math.max(0, targetY - 1.02), GOAL.planeZ + 0.45]} rotation-z={diveTilt}>
      <CharacterBody shirt="#f59e0b" shorts="#111827" />
      <mesh castShadow position={[-0.52, 1.18, 0]} rotation-z={0.2}>
        <boxGeometry args={[0.7, 0.1, 0.12]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.65} />
      </mesh>
      <mesh castShadow position={[0.52, 1.18, 0]} rotation-z={-0.2}>
        <boxGeometry args={[0.7, 0.1, 0.12]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.65} />
      </mesh>
    </group>
  );
}

function DefenderWall({ defenders, phase }: { defenders: DefenderConfig[]; phase: SceneProps["phase"] }) {
  return (
    <group>
      {defenders.map((defender, index) => {
        const lift = phase === "flying" || phase === "result" ? defender.jump : 0;

        return (
          <group key={defender.id} position={[defender.x, lift, defender.z]} rotation-y={(index - defenders.length / 2) * 0.05}>
            <CharacterBody shirt="#2563eb" shorts="#111827" />
            <mesh castShadow position={[-0.45, 1.36, 0]} rotation-z={0.9}>
              <boxGeometry args={[0.12, 0.58, 0.12]} />
              <meshStandardMaterial color="#2563eb" roughness={0.72} />
            </mesh>
            <mesh castShadow position={[0.45, 1.36, 0]} rotation-z={-0.9}>
              <boxGeometry args={[0.12, 0.58, 0.12]} />
              <meshStandardMaterial color="#2563eb" roughness={0.72} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function CharacterBody({ shirt, shorts }: { shirt: string; shorts: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 1.58, 0]}>
        <sphereGeometry args={[0.18, 24, 16]} />
        <meshStandardMaterial color="#f3c29f" roughness={0.78} />
      </mesh>
      <mesh castShadow position={[0, 1.17, 0]}>
        <capsuleGeometry args={[0.24, 0.58, 8, 16]} />
        <meshStandardMaterial color={shirt} roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0, 0.72, 0]}>
        <boxGeometry args={[0.48, 0.28, 0.2]} />
        <meshStandardMaterial color={shorts} roughness={0.68} />
      </mesh>
      <mesh castShadow position={[-0.36, 1.14, 0]} rotation-z={0.4}>
        <boxGeometry args={[0.12, 0.58, 0.12]} />
        <meshStandardMaterial color={shirt} roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0.36, 1.14, 0]} rotation-z={-0.4}>
        <boxGeometry args={[0.12, 0.58, 0.12]} />
        <meshStandardMaterial color={shirt} roughness={0.72} />
      </mesh>
    </group>
  );
}

function Ball({ launchTime, phase, shot }: { launchTime: number | null; phase: SceneProps["phase"]; shot: Shot | null }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) {
      return;
    }

    if (!shot || !launchTime) {
      ref.current.position.set(0, 0.11, 0);
      ref.current.rotation.set(0, 0, 0);
      return;
    }

    const elapsed = phase === "ready" ? 0 : Math.min((performance.now() - launchTime) / 1000, shot.travelTime);
    const position = simulateShotPosition(shot, elapsed);
    ref.current.position.set(position.x, position.y, position.z);
    ref.current.rotation.x -= 0.12 + shot.power * 0.12;
    ref.current.rotation.z += shot.curve * 0.04;
  });

  return (
    <mesh castShadow ref={ref} position={[0, 0.11, 0]}>
      <sphereGeometry args={[0.11, 32, 18]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      <mesh position={[0, 0.002, 0]}>
        <sphereGeometry args={[0.112, 12, 8]} />
        <meshBasicMaterial color="#111827" wireframe transparent opacity={0.38} />
      </mesh>
    </mesh>
  );
}

function AimPreview({ shot }: { shot: Shot }) {
  const points = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => {
        const point = simulateShotPosition(shot, (shot.travelTime * index) / 21);
        return new THREE.Vector3(point.x, point.y, point.z);
      }),
    [shot]
  );

  return <Line color="#facc15" lineWidth={2.4} points={points} transparent opacity={0.72} />;
}

function OutcomeMarker({ outcome }: { outcome: PenaltyOutcome }) {
  const color =
    outcome.type === "goal"
      ? "#22c55e"
      : outcome.type === "saved"
        ? "#60a5fa"
        : outcome.type === "blocked"
          ? "#fb7185"
          : "#f97316";

  return (
    <mesh position={[outcome.impact.x, outcome.impact.y, GOAL.planeZ + 0.08]}>
      <ringGeometry args={[0.18, 0.24, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.92} />
    </mesh>
  );
}
