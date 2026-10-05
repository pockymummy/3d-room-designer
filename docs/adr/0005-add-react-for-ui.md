# 0005. Add React for UI panels

- Status: Accepted
- Date: 2026-10-05

## Context
ADR 0002 deferred a UI framework until panels were needed. The first panel (wall and floor color pickers) is now being added, and more are expected (catalog, property editors, undo/redo). Options considered: React for panels only, full react-three-fiber, and Angular.

## Decision
- Use **React** for UI panels only, mounted from `src/main.ts` into a `#ui` element (`src/ui/`).
- The Three.js scene, `buildRoom(config)` and `RoomConfig` stay vanilla (ADR 0004). React edits the config and calls a rebuild callback.
- react-three-fiber and Angular were not chosen: R3F would replace the builder design, and Angular is heavy for a solo tool with a thin 3D ecosystem.

## Consequences
- Panels are easy to build and the config remains the single source of truth.
- Config is mutated in place and the scene rebuilt by callback; a proper store (e.g. Zustand) may be needed once undo/redo arrives.
- Adds `react`, `react-dom` and the Vite React plugin as dependencies (pinned exactly, ADR 0003).
- Supersedes the "no UI framework for now" part of ADR 0002.
