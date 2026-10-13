import type { Point, RoomConfig } from '../roomConfig';
import { addWall } from './commands';
import type { Store } from './store';
import type { ViewStore } from './viewState';

/** Walls snap to a 10 cm grid. */
export const GRID = 0.1;

export function snapToGrid(p: Point, step: number): Point {
  // `+ 0` turns -0 into 0 so snapped points compare cleanly.
  return { x: Math.round(p.x / step) * step + 0, z: Math.round(p.z / step) * step + 0 };
}

/** The first `wall-N` not used by any wall, so ids stay unique after removals. */
export function nextWallId(config: RoomConfig): string {
  const taken = new Set(config.walls.map((w) => w.id));
  let n = 1;
  while (taken.has(`wall-${n}`)) n++;
  return `wall-${n}`;
}

/** Turns the draw-wall tool on or off. Switching drops a half-drawn wall. */
export function toggleDrawWall(view: ViewStore) {
  view.set({ tool: view.get().tool === 'draw-wall' ? 'select' : 'draw-wall', wallStart: null });
}

/**
 * Handles a click on the floor plane while drawing. The first click is view state only; the
 * second dispatches one `addWall` (one undo step) and leaves the tool. New walls use the
 * thickness of the room's first wall.
 */
export function clickFloor(view: ViewStore, store: Store, floorPoint: Point) {
  if (view.get().tool !== 'draw-wall') return;
  const point = snapToGrid(floorPoint, GRID);
  const start = view.get().wallStart;
  if (!start) {
    view.set({ wallStart: point });
    return;
  }
  if (Math.hypot(point.x - start.x, point.z - start.z) < GRID / 2) return; // zero-length wall
  const config = store.getState().present;
  store.dispatch(
    addWall({
      id: nextWallId(config),
      start,
      end: point,
      thickness: config.walls[0]?.thickness ?? 0.1,
    }),
  );
  view.set({ tool: 'select', wallStart: null });
}
