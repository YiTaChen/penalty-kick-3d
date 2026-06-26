# Penalty Kick 3D

A browser-based 3D penalty-kick prototype built with React, Three.js, and TDD.

Repository: <https://github.com/YiTaChen/penalty-kick-3d>

## Current Prototype

- 3D low-poly penalty-kick scene rendered with React Three Fiber.
- Pointer drag aim controls for target, power, and curve.
- Tested shot physics, goal/result detection, keeper decision logic, and round scoring.
- Five-level campaign with escalating keeper difficulty.
- Additional defending players in later levels, including tested blocked-shot outcomes.
- Level selector for quick demoing and practice.
- Responsive desktop/mobile HUD.
- Self-generated ball, pitch, goal, net, player, and keeper geometry.

## Direction

- Focus first on a satisfying 12-yard penalty flow.
- Keep game rules and AI testable outside of rendering.
- Use CC0 or self-generated assets so the demo can be shared publicly on GitHub and LinkedIn.
- Push every small completed phase to GitHub.

## Planned TDD Phases

1. Project scaffold with Vitest. Done.
2. Shot vector and ball-flight calculation. Done.
3. Goal/result detection. Done.
4. Keeper decision logic. Done.
5. Aim mapping and round scoring. Done.
6. Interactive Three.js scene. Done.
7. Campaign levels and defender blocking. Done.
8. Documentation, asset credits, and CI. Done.

## Commands

```bash
npm install
npm test
npm run build
npm run dev
```

## Notes

The current prototype intentionally avoids external art assets. The next asset pass should prefer CC0 sources such as Kenney, Quaternius, KayKit, ambientCG, and Poly Haven, with every imported file recorded in `ASSET_CREDITS.md`.
