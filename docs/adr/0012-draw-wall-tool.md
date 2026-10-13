# 0012. Draw-wall tool: two clicks, view state until the second

- Status: Accepted
- Date: 2026-10-13

## Context
With walls as data (ADR 0011), the user needs a way to add one. A spike and a Playwright acceptance test came first (see ADR 0010); the spike showed that picking a floor point and rendering a rotated wall were straightforward, and that undo needed no change.

## Decision
- **Two clicks.** Click the "Draw wall" button, click a start point on the floor, click an end point. Only the second click changes the document: one `addWall` command, so one undo step and one audit entry.
- **Half-drawn state is view state.** The tool (`'draw-wall'`) and the first point (`wallStart`) live in `src/core/viewState.ts`, never in `RoomConfig`, history or the audit log. The logic is pure and lives in `src/core/drawWall.ts` (`toggleDrawWall`, `clickFloor`, `snapToGrid`, `nextWallId`).
- **Scene input is separate.** `src/floorPicking.ts` ray-casts a click to the y = 0 plane; `src/main.ts` connects it to `clickFloor` and disables OrbitControls while the tool is on. The UI button only toggles the tool.
- **Scope kept small:** drawn walls are partitions inside the room (the floor stays a stored rectangle); points snap to a 10 cm grid; the tool turns off after one wall; new walls take the thickness of the room's first wall; clicks pass through the front walls to the floor plane.

## Consequences
- A drag (press, move, release) is read as one click at the release point, so it sets only the start. There is no preview line, so the first click shows nothing. We found this when a manual attempt "did nothing" (see ADR 0013). Drag-to-draw and a preview line are the likely next steps.
- Not built yet: moving or deleting a wall, joining corners, per-wall thickness or color, cancelling with Escape, undo and redo buttons.
- The check from ADR 0011 held: `layout.ts` and `room.ts` were not changed to add this feature.
