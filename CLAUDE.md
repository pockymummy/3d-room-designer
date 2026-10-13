# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Requires Node >= 22.12 and pnpm.

```
pnpm install
pnpm dev          # Vite dev server
pnpm dev:debug    # dev server on :5174 that also writes browser console/click logs to debug-logs/browser.log (vite.debug.config.ts; nothing in src/ changes)
pnpm build        # tsc --noEmit (app) && tsc -p tsconfig.core.json (DOM-free core) && vite build
pnpm preview      # serve the production build
pnpm test         # Vitest: unit + jsdom component/integration tests (src/**/*.test.ts(x))
pnpm check:arch   # dependency-cruiser: architecture boundaries (ADR 0006)
pnpm e2e          # Playwright end-to-end tests in tests/ (starts pnpm dev itself)
```

Run all four checks (`pnpm test`, `pnpm check:arch`, `pnpm build`, `pnpm e2e`) before calling work done. TS is strict, with `noUnusedLocals`/`noUnusedParameters`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` and `noFallthroughCasesInSwitch`. There is no linter. Write tests first: red, green, refactor. Follow the project skill `tdd` (`.claude/skills/tdd/SKILL.md`); the reasoning is in ADR 0010.

## Architecture

Personal 3D room designer (condo layout: furniture, wallpaper, floor tiles), built with vanilla Three.js + Vite + TypeScript, with React for UI panels only (ADR 0002, ADR 0005).

The room is **data rendered by a builder** (ADR 0004), edited through a **pure core** (ADR 0006):
- `src/roomConfig.ts` — `RoomConfig`, the document: plain data with `readonly` fields (re-exported from `src/room.ts`): height, a floor rectangle, a list of `Wall` segments (id, start, end, thickness) and two colors (ADR 0011).
- `src/core/` — pure TS with no DOM/React/three.js: `commands.ts` (edits as `{ type, args }` data + `applyCommand`/`describeCommand`), `history.ts` (snapshot undo/redo), `auditLog.ts` (append-only), `store.ts` (`createStore`: present state, dispatch/undo/redo, audit log, subscribe), `shortcuts.ts` (key -> undo/redo), `viewState.ts` (selection/hover/tool and the first point of a wall being drawn, kept apart from the document), `drawWall.ts` (snap to a 10 cm grid, wall ids, the two-click draw-wall logic that dispatches `addWall`).
- `src/layout.ts` — pure `layoutRoom(config)` -> `Part[]` (id, size, position, rotationY, color); no three.js.
- `src/room.ts` — `buildRoom(config)`: maps the parts to a `THREE.Group` of meshes (mesh name = part id).
- `src/floorPicking.ts` — three.js ray-cast from a click to the floor plane (y = 0); `main.ts` hooks it to `clickFloor` and disables OrbitControls while the draw-wall tool is on.
- `src/app.ts` — `createApp({ uiElement, scene, store })`: subscribes the store to the scene, mounts the UI, handles Ctrl/Cmd+Z and +Shift+Z. Needs no renderer.
- `src/main.ts` — thin shell: renderer, camera, OrbitControls, lights, resize, render loop; creates the store and calls `createApp`.
- `src/defaultRoom.ts` — the hard-coded sample `RoomConfig`.
- `src/ui/` — React panels (`mountUi`, `ColorPanel` using react-colorful, ADR 0009). They dispatch commands to the store and never touch scene objects.
- `tests/` + `specs/` — Playwright tests, one per file, and the scenario plan (ADR 0008).

Future features (floor-plan editor, material swapping, furniture, save/load) add commands and keep room state in `RoomConfig`, never in scene objects. The config is intentionally minimal (a stored floor rectangle, a wall list, flat global colors); deriving the floor from walls or a polygon outline is deferred (ADR 0011).

## Conventions

- Units are meters, Y is up, floor top is at y = 0.
- Walls are placed outside the floor footprint so the interior is exactly `width x length`.
- Dependencies are pinned to exact versions (no `^`/`~`); keep `three` and `@types/three` in step (ADR 0003).
- Document state (`RoomConfig`) is immutable and changes only via `store.dispatch(command)`; it is the only thing that is undoable, logged or saved. View state (selection, hover, tool, camera) never goes in `RoomConfig` or the history.
- Keep `src/core/`, `src/layout.ts` and `src/roomConfig.ts` free of `three`, `react` and the DOM (`pnpm check:arch` and `tsconfig.core.json` enforce it); `src/ui/` must not import `three`.
- Commands are plain `{ type, args }` data interpreted by pure functions (action/reducer style, not the GoF pattern: no `execute()`/`undo()` on the command; undo restores snapshots). Adding a command means adding it to the `Command` union and a case to both `applyCommand` and `describeCommand` in `src/core/commands.ts` (the exhaustive `never` checks fail the build otherwise), plus an entry in the `samples` list in `src/core/commands.test.ts` (not compiler-checked). At about the third command type, consider a typed handler table (see ADR 0006). Keep commands free of functions and handlers pure.
- No test-only hooks in app code. Playwright tests change colors with the hex box or by dragging the picker (never the old native popup) and assert on canvas pixels with tolerance.
- Architecture decisions are recorded as ADRs in `docs/adr/` (copy `0000-template.md`); add one for significant decisions.
