# 0004. Describe the room as data, rendered by a builder

- Status: Accepted
- Date: 2026-10-04

## Context
Future phases add a 2D floor-plan editor, material swapping, furniture, save/load and undo/redo. All of them need to change the room and see the 3D scene update.

## Decision
- The room is a plain data object (`RoomConfig` in `src/room.ts`); the sample room lives in `src/defaultRoom.ts`.
- `buildRoom(config)` turns that data into a `THREE.Group`. Scene setup (renderer, camera, lights, loop) stays in `src/main.ts`.
- Units are meters, Y is up, the floor is at y = 0.

## Consequences
- Saving, loading and undo/redo reduce to serializing and swapping config objects.
- A later UI layer (e.g. React) can own the data and call the same builder.
- The config is deliberately minimal now (rectangular room, flat colors) and will be extended or replaced by a wall/polygon model when the floor-plan editor arrives. (Update: ADR 0011 replaced the rectangle with a list of wall segments.)
