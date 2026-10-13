import { describe, expect, it } from 'vitest';
import { defaultRoom } from './defaultRoom';
import { layoutRoom, type Part, type PartId } from './layout';

const part = (id: PartId, parts: Part[]) => parts.find((p) => p.id === id)!;

describe('layoutRoom', () => {
  const { height, wallColor, floorColor } = defaultRoom;
  const { width, length } = defaultRoom.floor;
  const t = defaultRoom.walls[0]!.thickness;
  const parts = layoutRoom(defaultRoom);

  it('returns a floor and four walls with stable ids', () => {
    expect(parts.map((p) => p.id)).toEqual([
      'floor',
      'wall-north',
      'wall-south',
      'wall-west',
      'wall-east',
    ]);
  });

  it('makes the floor width x length with its top at y = 0', () => {
    const floor = part('floor', parts);
    expect(floor.size[0]).toBeCloseTo(width);
    expect(floor.size[2]).toBeCloseTo(length);
    expect(floor.position[1] + floor.size[1] / 2).toBeCloseTo(0);
  });

  it('puts the north and south walls outside the floor, spanning the corners', () => {
    const north = part('wall-north', parts);
    const south = part('wall-south', parts);
    expect(north.position).toEqual([0, height / 2, -(length / 2 + t / 2)]);
    expect(south.position).toEqual([0, height / 2, length / 2 + t / 2]);
    expect(north.size).toEqual([width + 2 * t, height, t]);
    expect(south.size).toEqual([width + 2 * t, height, t]);
  });

  it('puts the west and east walls outside the floor, spanning the length', () => {
    const west = part('wall-west', parts);
    const east = part('wall-east', parts);
    expect(west.position).toEqual([-(width / 2 + t / 2), height / 2, 0]);
    expect(east.position).toEqual([width / 2 + t / 2, height / 2, 0]);
    expect(west.size).toEqual([t, height, length]);
    expect(east.size).toEqual([t, height, length]);
  });

  it('colors the floor and the walls separately', () => {
    expect(part('floor', parts).color).toBe(floorColor);
    for (const id of ['wall-north', 'wall-south', 'wall-west', 'wall-east'] as const) {
      expect(part(id, parts).color).toBe(wallColor);
    }
  });

  it('follows the config', () => {
    const bigger = layoutRoom({ ...defaultRoom, floor: { width: 6, length: 8 } });
    expect(part('floor', bigger).size[0]).toBeCloseTo(6);
  });

  it('makes one wall part per entry in config.walls, with the wall id as the part id', () => {
    const walls = [
      { id: 'a', start: { x: 0, z: 0 }, end: { x: 3, z: 0 }, thickness: 0.2 },
      { id: 'b', start: { x: 0, z: 0 }, end: { x: 0, z: 2 }, thickness: 0.1 },
    ];
    const result = layoutRoom({ ...defaultRoom, walls });
    expect(result.map((p) => p.id)).toEqual(['floor', 'a', 'b']);
  });

  it('sizes and centres a wall from its segment, height and thickness', () => {
    const wall = { id: 'a', start: { x: 1, z: 2 }, end: { x: 4, z: 2 }, thickness: 0.2 };
    const a = part('a', layoutRoom({ ...defaultRoom, walls: [wall] }));
    expect(a.size).toEqual([3, height, 0.2]);
    expect(a.position).toEqual([2.5, height / 2, 2]);
    expect(a.rotationY).toBe(0);
  });

  it('keeps a wall along z unrotated, with its length on z', () => {
    const wall = { id: 'a', start: { x: 1, z: 0 }, end: { x: 1, z: 4 }, thickness: 0.2 };
    const a = part('a', layoutRoom({ ...defaultRoom, walls: [wall] }));
    expect(a.size).toEqual([0.2, height, 4]);
    expect(a.position).toEqual([1, height / 2, 2]);
    expect(a.rotationY).toBe(0);
  });

  it('rotates a diagonal wall about Y so its length runs from start to end', () => {
    const wall = { id: 'a', start: { x: -1, z: -1 }, end: { x: 1, z: 1 }, thickness: 0.1 };
    const a = part('a', layoutRoom({ ...defaultRoom, walls: [wall] }));
    expect(a.size[0]).toBeCloseTo(Math.hypot(2, 2));
    expect(a.size[2]).toBeCloseTo(0.1);
    expect(a.position).toEqual([0, height / 2, 0]);
    // three.js rotation about +Y maps the local +x axis to (cos r, 0, -sin r)
    const r = a.rotationY;
    expect(Math.cos(r)).toBeCloseTo(1 / Math.SQRT2);
    expect(-Math.sin(r)).toBeCloseTo(1 / Math.SQRT2);
  });
});
