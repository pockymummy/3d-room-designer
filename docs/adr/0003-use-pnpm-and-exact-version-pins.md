# 0003. Use pnpm and exact version pins

- Status: Accepted
- Date: 2026-10-04

## Context
Three.js releases frequently with occasional breaking changes, and `@types/three` must track its version. Vite 8 and TypeScript 7 are recent major releases.

## Decision
- Package manager: **pnpm**; commit `pnpm-lock.yaml`.
- Runtime: **Node.js 22 LTS** (`engines.node >= 22.12.0`, required by Vite 8).
- Dependencies are pinned to exact versions (no `^`/`~`), checked against the npm registry on 2026-10-04:
  - `three` 0.186.1
  - `@types/three` 0.186.0
  - `vite` 8.3.2
  - `typescript` 7.0.2

## Consequences
- Reproducible installs; upgrades are deliberate.
- We must bump versions manually (and keep `three` and `@types/three` in step).
- If TypeScript 7 or Vite 8 cause problems, fall back to the previous major and record it here.
