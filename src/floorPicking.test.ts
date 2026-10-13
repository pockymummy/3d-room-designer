import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { ndcFromPointer, screenToFloor } from './floorPicking';

const makeCamera = () => {
  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 100);
  camera.position.set(6, 6, 8);
  camera.lookAt(0, 1, 0);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  return camera;
};

describe('screenToFloor', () => {
  it('maps the projection of a floor point back to that point', () => {
    const camera = makeCamera();
    for (const [x, z] of [[0, 0], [2, 1], [-1.5, -2.5]] as const) {
      const ndc = new THREE.Vector3(x, 0, z).project(camera);
      const p = screenToFloor(ndc.x, ndc.y, camera);
      expect(p?.x).toBeCloseTo(x);
      expect(p?.z).toBeCloseTo(z);
    }
  });

  it('returns null when the ray points at the sky', () => {
    const camera = makeCamera();
    camera.position.set(0, 1, 0);
    camera.lookAt(0, 5, -5); // tilted up: every ray leaves the room through the sky
    camera.updateMatrixWorld();
    expect(screenToFloor(0, 0, camera)).toBeNull();
  });
});

describe('ndcFromPointer', () => {
  it('maps the centre to 0,0 and the top-left to -1,1', () => {
    const rect = { left: 100, top: 50, width: 200, height: 100 };
    expect(ndcFromPointer(200, 100, rect)).toEqual({ x: 0, y: 0 });
    expect(ndcFromPointer(100, 50, rect)).toEqual({ x: -1, y: 1 });
  });
});
