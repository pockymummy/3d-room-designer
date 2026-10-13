import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createApp } from './app';
import { clickFloor } from './core/drawWall';
import { createStore } from './core/store';
import { createViewStore } from './core/viewState';
import { defaultRoom } from './defaultRoom';
import { onFloorClick } from './floorPicking';

const container = document.getElementById('app')!;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1e1e);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(6, 6, 8);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.maxPolarAngle = Math.PI / 2 - 0.02; // keep camera above the floor
controls.update();

scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 1.2));
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(5, 8, 4);
sun.castShadow = true;
scene.add(sun);

const store = createStore(defaultRoom);
const view = createViewStore();
createApp({ uiElement: document.getElementById('ui')!, scene, store, view });

// While the draw-wall tool is on, clicks place wall points and the camera must not orbit.
const syncControls = () => {
  controls.enabled = view.get().tool !== 'draw-wall';
};
view.subscribe(syncControls);
onFloorClick(renderer.domElement, camera, (point) => clickFloor(view, store, point));

function resize() {
  const { clientWidth: w, clientHeight: h } = container;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
