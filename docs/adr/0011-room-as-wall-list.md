# 0011. Describe walls as a list of segments

- Status: Accepted
- Date: 2026-10-13

## Context
`RoomConfig` was a fixed rectangle (`width`, `length`, `wallThickness`) and `layoutRoom` hard-coded four walls, so a "draw a wall" feature had nowhere to store its data. A throwaway spike (hack the feature through the old model, then delete it) showed where the model resisted:
- two wall representations (the four implicit walls and a separate list) and a global thickness;
- index-based ids for drawn walls, which break selection once a wall is removed;
- a closed `PartId` union, and `Part` with no rotation, so a diagonal wall could not be drawn.
Undo needed no change: a new command went through `dispatch` and history unchanged.

## Decision
- `RoomConfig` is `{ height, floor: { width, length }, walls: Wall[], wallColor, floorColor }`.
- A `Wall` is `{ id, start, end, thickness }`: a centerline segment on the floor plane with a stable id. The default room is four explicit walls, with the same ids as before (`wall-north` ...), placed just outside the floor so the interior is exactly `width x length`.
- `layoutRoom` emits one part per wall. `Part` gains `rotationY` and `PartId` is a string (`'floor'` or a wall id). Walls along x or z are not rotated (their size is swapped instead); other walls get `rotationY = atan2(-dz, dx)`. `buildRoom` applies the rotation.
- The floor stays a stored rectangle, and wall color stays global. Drawn walls are partitions inside the room.
- This is a refactor with no behavior change. Adding a wall is a new command that must not touch `layout.ts` or `room.ts`; that is how we check this model paid off. It held: the draw-wall feature (ADR 0012) added `addWall` without changing either file.

## Consequences
- Walls have identity, so later features (wallpaper per wall, selection, moving a wall) have something to attach to.
- Wall corners are not joined: walls overlap or leave gaps unless their segments are chosen to meet, as the default room's do.
- The floor can drift from the walls, because it is not derived from them. Deriving it, or moving to a polygon outline, is left for when non-rectangular rooms are wanted.
- Supersedes the rectangular-config part of ADR 0004.
