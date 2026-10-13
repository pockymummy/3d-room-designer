import * as THREE from 'three';
import { keyToAction } from './core/shortcuts';
import type { Store } from './core/store';
import { createViewStore, type ViewStore } from './core/viewState';
import { buildRoom } from './room';
import { mountUi } from './ui/mountUi';

export interface AppOptions {
  /** Where the UI panels are mounted. */
  uiElement: HTMLElement;
  /** Scene that the room is built into; the renderer lives outside this module. */
  scene: THREE.Scene;
  store: Store;
  /** View state (tool, selection); kept apart from the document. Defaults to a fresh one. */
  view?: ViewStore;
  /** Where keyboard shortcuts are listened for. */
  keyTarget?: Pick<Document, 'addEventListener' | 'removeEventListener'>;
}

/**
 * Wires the document store to the scene, the UI and the keyboard. It needs no renderer
 * or WebGL, so it is covered by a jsdom integration test; main.ts only adds the renderer,
 * camera, controls and render loop around it.
 */
export function createApp({
  uiElement,
  scene,
  store,
  view = createViewStore(),
  keyTarget = document,
}: AppOptions) {
  let room: THREE.Group | undefined;

  function removeRoom() {
    if (!room) return;
    scene.remove(room);
    room.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    });
    room = undefined;
  }

  function rebuildRoom() {
    removeRoom();
    room = buildRoom(store.getState().present);
    scene.add(room);
  }

  rebuildRoom();
  const unsubscribe = store.subscribe(rebuildRoom);
  const unmountUi = mountUi(uiElement, store, view);

  // Ctrl+Z always undoes the document, even while a text field has focus, so there is one
  // undo model; preventDefault stops the browser's own text undo from fighting it.
  const onKeyDown = (e: KeyboardEvent) => {
    const action = keyToAction(e);
    if (!action) return;
    e.preventDefault();
    store[action]('shortcut');
  };
  keyTarget.addEventListener('keydown', onKeyDown as EventListener);

  return {
    dispose() {
      keyTarget.removeEventListener('keydown', onKeyDown as EventListener);
      unsubscribe();
      unmountUi();
      removeRoom();
    },
  };
}
