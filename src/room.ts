import * as THREE from 'three';
import { layoutRoom } from './layout';
import type { RoomConfig } from './roomConfig';

export type { RoomConfig } from './roomConfig';

/** Turns the pure room layout into three.js meshes (the "how it looks" half). */
export function buildRoom(config: RoomConfig): THREE.Group {
  const room = new THREE.Group();
  room.name = 'room';

  for (const part of layoutRoom(config)) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(...part.size),
      new THREE.MeshStandardMaterial({ color: part.color }),
    );
    mesh.name = part.id;
    mesh.position.set(...part.position);
    mesh.rotation.y = part.rotationY;
    mesh.receiveShadow = true;
    mesh.castShadow = part.id !== 'floor';
    room.add(mesh);
  }

  return room;
}
