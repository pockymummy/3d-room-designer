import * as THREE from 'three';

/** All units are meters, Y is up, floor sits at y = 0. */
export interface RoomConfig {
  width: number; // x extent
  length: number; // z extent
  height: number;
  wallThickness: number;
  wallColor: number;
  floorColor: number;
}

export function buildRoom(config: RoomConfig): THREE.Group {
  const { width, length, height, wallThickness: t, wallColor, floorColor } = config;
  const room = new THREE.Group();
  room.name = 'room';

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.05, length),
    new THREE.MeshStandardMaterial({ color: floorColor }),
  );
  floor.position.y = -0.025;
  floor.receiveShadow = true;
  room.add(floor);

  const wallMaterial = new THREE.MeshStandardMaterial({ color: wallColor });
  const addWall = (w: number, d: number, x: number, z: number) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, height, d), wallMaterial);
    wall.position.set(x, height / 2, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    room.add(wall);
  };

  // Walls sit just outside the floor footprint so the interior is exactly width x length.
  addWall(width + 2 * t, t, 0, -(length / 2 + t / 2)); // north
  addWall(width + 2 * t, t, 0, length / 2 + t / 2); // south
  addWall(t, length, -(width / 2 + t / 2), 0); // west
  addWall(t, length, width / 2 + t / 2, 0); // east

  return room;
}
