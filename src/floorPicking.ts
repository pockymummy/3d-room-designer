import * as THREE from 'three';
import type { Point } from './roomConfig';

const FLOOR_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

/** Pointer position in client pixels -> normalized device coordinates (-1..1, y up). */
export function ndcFromPointer(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
) {
  return {
    x: ((clientX - rect.left) / rect.width) * 2 - 1,
    y: -((clientY - rect.top) / rect.height) * 2 + 1,
  };
}

/** Where the ray through a normalized screen position meets the floor plane (y = 0), or null. */
export function screenToFloor(ndcX: number, ndcY: number, camera: THREE.Camera): Point | null {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
  const hit = raycaster.ray.intersectPlane(FLOOR_PLANE, new THREE.Vector3());
  return hit ? { x: hit.x, z: hit.z } : null;
}

/** Calls `onFloorClick` with the floor point under each click on `element`. Returns a detach function. */
export function onFloorClick(
  element: HTMLElement,
  camera: THREE.Camera,
  handler: (point: Point) => void,
) {
  const listener = (e: MouseEvent) => {
    const ndc = ndcFromPointer(e.clientX, e.clientY, element.getBoundingClientRect());
    const point = screenToFloor(ndc.x, ndc.y, camera);
    if (point) handler(point);
  };
  element.addEventListener('click', listener);
  return () => element.removeEventListener('click', listener);
}
