import { describe, expect, it } from 'vitest';
import { defaultRoom } from './defaultRoom';
import { layoutRoom, type Part, type PartId } from './layout';

const part = (id: PartId, parts: Part[]) => parts.find((p) => p.id === id)!;

describe('layoutRoom', () => {
  const { width, length, height, wallThickness: t, wallColor, floorColor } = defaultRoom;
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
    const bigger = layoutRoom({ ...defaultRoom, width: 6, length: 8 });
    expect(part('floor', bigger).size[0]).toBeCloseTo(6);
    expect(part('wall-north', bigger).position[2]).toBeCloseTo(-(8 / 2 + t / 2));
  });
});
