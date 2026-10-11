import type { RoomConfig } from './roomConfig';

export type PartId = 'floor' | `wall-${'north' | 'south' | 'west' | 'east'}`;

type Vec3 = [number, number, number];

/** A box in the room: size and center position in meters, plus its color. */
export interface Part {
  id: PartId;
  size: Vec3;
  position: Vec3;
  color: number;
}

const FLOOR_THICKNESS = 0.05;

/**
 * Pure layout of the room: what exists and where. No three.js here, so it can be
 * tested with plain numbers. Walls sit just outside the floor footprint so the
 * interior is exactly width x length.
 */
export function layoutRoom(config: RoomConfig): Part[] {
  const { width, length, height, wallThickness: t, wallColor, floorColor } = config;

  const wall = (id: PartId, size: Vec3, x: number, z: number): Part => ({
    id,
    size,
    position: [x, height / 2, z],
    color: wallColor,
  });

  return [
    {
      id: 'floor',
      size: [width, FLOOR_THICKNESS, length],
      position: [0, -FLOOR_THICKNESS / 2, 0],
      color: floorColor,
    },
    wall('wall-north', [width + 2 * t, height, t], 0, -(length / 2 + t / 2)),
    wall('wall-south', [width + 2 * t, height, t], 0, length / 2 + t / 2),
    wall('wall-west', [t, height, length], -(width / 2 + t / 2), 0),
    wall('wall-east', [t, height, length], width / 2 + t / 2, 0),
  ];
}
