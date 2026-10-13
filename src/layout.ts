import type { RoomConfig, Wall } from './roomConfig';

/** 'floor' or a wall's id. */
export type PartId = string;

type Vec3 = [number, number, number];

/** A box in the room: size and center position in meters, plus its color. */
export interface Part {
  id: PartId;
  size: Vec3;
  position: Vec3;
  /** Rotation about the Y axis in radians (three.js convention). Zero for axis-aligned walls. */
  rotationY: number;
  color: number;
}

const FLOOR_THICKNESS = 0.05;

/**
 * A wall is a box whose length runs from `start` to `end`. Walls along x or along z are not
 * rotated (their size is swapped instead), so the common rectangular room stays axis-aligned.
 */
function wallPart(wall: Wall, height: number, color: number): Part {
  const dx = wall.end.x - wall.start.x;
  const dz = wall.end.z - wall.start.z;
  const length = Math.hypot(dx, dz);
  const t = wall.thickness;
  const position: Vec3 = [
    (wall.start.x + wall.end.x) / 2,
    height / 2,
    (wall.start.z + wall.end.z) / 2,
  ];
  if (dz === 0) return { id: wall.id, size: [length, height, t], position, rotationY: 0, color };
  if (dx === 0) return { id: wall.id, size: [t, height, length], position, rotationY: 0, color };
  return { id: wall.id, size: [length, height, t], position, rotationY: Math.atan2(-dz, dx), color };
}

/**
 * Pure layout of the room: what exists and where. No three.js here, so it can be
 * tested with plain numbers.
 */
export function layoutRoom(config: RoomConfig): Part[] {
  const { floor, height, walls, wallColor, floorColor } = config;

  return [
    {
      id: 'floor',
      size: [floor.width, FLOOR_THICKNESS, floor.length],
      position: [0, -FLOOR_THICKNESS / 2, 0],
      rotationY: 0,
      color: floorColor,
    },
    ...walls.map((wall) => wallPart(wall, height, wallColor)),
  ];
}
