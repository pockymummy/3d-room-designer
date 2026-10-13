import { describe, expect, it } from 'vitest';
import { defaultRoom } from '../defaultRoom';
import { clickFloor, nextWallId, snapToGrid, toggleDrawWall } from './drawWall';
import { createStore } from './store';
import { createViewStore } from './viewState';

describe('snapToGrid', () => {
  it('rounds both coordinates to the grid step', () => {
    const p = snapToGrid({ x: 1.04, z: -0.96 }, 0.1);
    expect(p.x).toBeCloseTo(1.0);
    expect(p.z).toBeCloseTo(-1.0);
  });

  it('never returns negative zero', () => {
    expect(Object.is(snapToGrid({ x: -0.01, z: 0.01 }, 0.1).x, 0)).toBe(true);
  });
});

describe('nextWallId', () => {
  it('uses wall-1 in a room without numbered walls', () => {
    expect(nextWallId(defaultRoom)).toBe('wall-1');
  });

  it('skips ids that are taken, even after a removal left a gap', () => {
    const wall = (id: string) => ({ id, start: { x: 0, z: 0 }, end: { x: 1, z: 0 }, thickness: 0.1 });
    const room = { ...defaultRoom, walls: [...defaultRoom.walls, wall('wall-1'), wall('wall-3')] };
    expect(nextWallId(room)).toBe('wall-2');
  });
});

describe('toggleDrawWall', () => {
  it('switches the tool on and off and forgets a pending start', () => {
    const view = createViewStore();
    toggleDrawWall(view);
    expect(view.get().tool).toBe('draw-wall');

    view.set({ wallStart: { x: 1, z: 1 } });
    toggleDrawWall(view);
    expect(view.get()).toMatchObject({ tool: 'select', wallStart: null });
  });
});

describe('clickFloor', () => {
  const setup = () => ({
    store: createStore(defaultRoom, { now: () => 0 }),
    view: createViewStore(),
  });

  it('does nothing unless the draw-wall tool is active', () => {
    const { store, view } = setup();
    clickFloor(view, store, { x: 1, z: 1 });
    expect(view.get().wallStart).toBeNull();
    expect(store.getState().auditLog).toEqual([]);
  });

  it('the first click only remembers the snapped start, in view state', () => {
    const { store, view } = setup();
    toggleDrawWall(view);
    clickFloor(view, store, { x: 1.04, z: 0.96 });
    expect(view.get().wallStart?.x).toBeCloseTo(1.0);
    expect(view.get().wallStart?.z).toBeCloseTo(1.0);
    expect(store.getState().auditLog).toEqual([]);
  });

  it('the second click adds one wall, with the room thickness, and leaves the tool', () => {
    const { store, view } = setup();
    toggleDrawWall(view);
    clickFloor(view, store, { x: -1, z: -1 });
    clickFloor(view, store, { x: 1.02, z: 0.98 });

    const walls = store.getState().present.walls;
    expect(walls).toHaveLength(5);
    const added = walls[4]!;
    expect(added.id).toBe('wall-1');
    expect(added.start).toEqual({ x: -1, z: -1 });
    expect(added.end.x).toBeCloseTo(1.0);
    expect(added.end.z).toBeCloseTo(1.0);
    expect(added.thickness).toBe(defaultRoom.walls[0]!.thickness);
    expect(view.get()).toMatchObject({ tool: 'select', wallStart: null });
    expect(store.getState().auditLog.map((e) => e.type)).toEqual(['addWall']);
  });

  it('ignores a second click on the same grid point, keeping the start', () => {
    const { store, view } = setup();
    toggleDrawWall(view);
    clickFloor(view, store, { x: 1, z: 1 });
    clickFloor(view, store, { x: 1.01, z: 1.01 });
    expect(store.getState().present.walls).toHaveLength(4);
    expect(view.get().tool).toBe('draw-wall');
    expect(view.get().wallStart).not.toBeNull();
  });

  it('is one undo step', () => {
    const { store, view } = setup();
    toggleDrawWall(view);
    clickFloor(view, store, { x: 0, z: 0 });
    clickFloor(view, store, { x: 2, z: 0 });
    store.undo();
    expect(store.getState().present.walls).toEqual(defaultRoom.walls);
  });
});
