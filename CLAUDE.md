# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Requires Node >= 22.12 and pnpm.

```
pnpm install
pnpm dev       # Vite dev server
pnpm build     # tsc --noEmit (type-check) && vite build
pnpm preview   # serve the production build
```

There is no test runner or linter configured; `pnpm build` is the only correctness check (strict TS, `noUnusedLocals`/`noUnusedParameters` are on).

## Architecture

Personal 3D room designer (condo layout: furniture, wallpaper, floor tiles), built with vanilla Three.js + Vite + TypeScript (no UI framework; see ADR 0002).

The room is **data rendered by a builder** (ADR 0004):
- `src/room.ts` — `RoomConfig` interface and `buildRoom(config)`, which returns a `THREE.Group` (floor + four walls).
- `src/defaultRoom.ts` — the hard-coded sample `RoomConfig`.
- `src/main.ts` — scene setup only: renderer, camera, OrbitControls, lights, resize handling and the render loop. It builds the room from `defaultRoom`.

Future features (floor-plan editor, material swapping, furniture, save/load, undo/redo) are expected to mutate/serialize the config object and re-run the builder, so keep room state in `RoomConfig` rather than in scene objects. The config is intentionally minimal (rectangular room, flat colors) and may be replaced by a wall/polygon model.

## Conventions

- Units are meters, Y is up, floor top is at y = 0.
- Walls are placed outside the floor footprint so the interior is exactly `width x length`.
- Dependencies are pinned to exact versions (no `^`/`~`); keep `three` and `@types/three` in step (ADR 0003).
- Architecture decisions are recorded as ADRs in `docs/adr/` (copy `0000-template.md`); add one for significant decisions.
