import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { defaultRoom } from './defaultRoom';
import { buildRoom, type RoomConfig } from './room';

const meshes = (config: RoomConfig) => buildRoom(config).children as THREE.Mesh[];
const box = (mesh: THREE.Mesh) => new THREE.Box3().setFromObject(mesh);
const color = (mesh: THREE.Mesh) => (mesh.material as THREE.MeshStandardMaterial).color.getHex();

/** Pins today's buildRoom behaviour: child 0 is the floor, children 1..4 are the walls. */
describe('buildRoom', () => {
  const { height, wallColor, floorColor } = defaultRoom;
  const { width, length } = defaultRoom.floor;
  const t = defaultRoom.walls[0]!.thickness;

  it('returns a group named room with a floor and four walls', () => {
    const room = buildRoom(defaultRoom);
    expect(room.name).toBe('room');
    expect(room.children).toHaveLength(5);
    expect(room.children.every((c) => c instanceof THREE.Mesh)).toBe(true);
  });

  it('puts the floor top at y = 0', () => {
    const floor = box(meshes(defaultRoom)[0]!);
    expect(floor.max.y).toBeCloseTo(0);
  });

  it('makes the floor exactly width x length', () => {
    const size = box(meshes(defaultRoom)[0]!).getSize(new THREE.Vector3());
    expect(size.x).toBeCloseTo(width);
    expect(size.z).toBeCloseTo(length);
  });

  it('places walls outside the floor footprint so the interior is exactly width x length', () => {
    const [floor, ...walls] = meshes(defaultRoom).map(box);
    for (const wall of walls) {
      const overlapX = Math.min(wall.max.x, floor!.max.x) - Math.max(wall.min.x, floor!.min.x);
      const overlapZ = Math.min(wall.max.z, floor!.max.z) - Math.max(wall.min.z, floor!.min.z);
      expect(overlapX > 1e-9 && overlapZ > 1e-9).toBe(false);
    }
  });

  it('centres the walls at +-(length/2 + t/2) on z and +-(width/2 + t/2) on x', () => {
    const [, north, south, west, east] = meshes(defaultRoom);
    expect(north!.position.z).toBeCloseTo(-(length / 2 + t / 2));
    expect(south!.position.z).toBeCloseTo(length / 2 + t / 2);
    expect(west!.position.x).toBeCloseTo(-(width / 2 + t / 2));
    expect(east!.position.x).toBeCloseTo(width / 2 + t / 2);
  });

  it('stands the walls from y = 0 up to the room height', () => {
    for (const wall of meshes(defaultRoom).slice(1).map(box)) {
      expect(wall.min.y).toBeCloseTo(0);
      expect(wall.max.y).toBeCloseTo(height);
    }
  });

  it('applies the floor and wall colors to the materials', () => {
    const [floor, ...walls] = meshes(defaultRoom);
    expect(color(floor!)).toBe(floorColor);
    for (const wall of walls) expect(color(wall)).toBe(wallColor);
  });

  it('scales the floor when the width changes', () => {
    const size = box(meshes({ ...defaultRoom, floor: { width: 6, length: defaultRoom.floor.length } })[0]!).getSize(new THREE.Vector3());
    expect(size.x).toBeCloseTo(6);
  });
});
