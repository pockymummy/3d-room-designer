import type { RoomConfig } from './room';

const width = 4;
const length = 5;
const t = 0.1; // wall thickness

// Walls sit just outside the floor footprint so the interior is exactly width x length.
// The north/south walls span the corners; the west/east walls run between them.
export const defaultRoom: RoomConfig = {
  height: 2.6,
  floor: { width, length },
  walls: [
    {
      id: 'wall-north',
      start: { x: -(width / 2 + t), z: -(length / 2 + t / 2) },
      end: { x: width / 2 + t, z: -(length / 2 + t / 2) },
      thickness: t,
    },
    {
      id: 'wall-south',
      start: { x: -(width / 2 + t), z: length / 2 + t / 2 },
      end: { x: width / 2 + t, z: length / 2 + t / 2 },
      thickness: t,
    },
    {
      id: 'wall-west',
      start: { x: -(width / 2 + t / 2), z: -length / 2 },
      end: { x: -(width / 2 + t / 2), z: length / 2 },
      thickness: t,
    },
    {
      id: 'wall-east',
      start: { x: width / 2 + t / 2, z: -length / 2 },
      end: { x: width / 2 + t / 2, z: length / 2 },
      thickness: t,
    },
  ],
  wallColor: 0xf2eee6,
  floorColor: 0xb08968,
};
