# 0002. Use vanilla Three.js, Vite and TypeScript

- Status: Accepted
- Date: 2026-10-04

## Context
We want a browser-based 3D room designer for personal use. The first milestone is only to render a default room; there is no UI yet. Options considered: Three.js with React (react-three-fiber), vanilla Three.js, and Babylon.js.

## Decision
- **Three.js** for rendering: largest ecosystem, native glTF/GLB support for the future furniture catalog, many editor examples (OrbitControls, TransformControls).
- **No UI framework for now.** React (react-three-fiber) is expected to pay off once there are panels, a catalog, property editors and undo/redo, but a hello-world needs none of that. Adopting it later is a new ADR.
- **Vite** as dev server and bundler, **TypeScript** (strict) for type safety.

## Consequences
- Minimal setup and very little to learn up front.
- When UI arrives we will need to migrate or wrap the scene code. Keeping room logic as plain functions over data (see ADR 0004) keeps that migration cheap.
- Babylon.js was not chosen: fewer room-designer examples, and we do not need a full engine.
