// @vitest-environment jsdom
import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import * as THREE from 'three';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from './app';
import { createStore } from './core/store';
import { createViewStore } from './core/viewState';
import { defaultRoom } from './defaultRoom';

/**
 * Integration test of the wiring: real store, real UI, real buildRoom, a plain THREE.Scene.
 * No renderer and no WebGL, and no test-only hooks in the app.
 */
describe('createApp', () => {
  let dispose: (() => void) | undefined;

  afterEach(() => {
    dispose?.();
    dispose = undefined;
    cleanup();
    document.body.innerHTML = '';
  });

  const start = async () => {
    const uiElement = document.createElement('div');
    document.body.appendChild(uiElement);
    const scene = new THREE.Scene();
    const store = createStore(defaultRoom, { now: () => 0 });
    const view = createViewStore();
    await act(async () => {
      dispose = createApp({ uiElement, scene, store, view }).dispose;
    });
    return { scene, store, view };
  };

  const wallColor = (scene: THREE.Scene) =>
    ((scene.getObjectByName('wall-north') as THREE.Mesh).material as THREE.MeshStandardMaterial).color.getHex();

  const setWall = (hex: string) => {
    const input = screen.getByLabelText('Wall hex');
    fireEvent.change(input, { target: { value: hex } });
    fireEvent.keyDown(input, { key: 'Enter' });
  };

  const press = (init: KeyboardEventInit, target: EventTarget = document) =>
    fireEvent.keyDown(target as Element, init);

  it('builds the room into the scene from the store', async () => {
    const { scene } = await start();
    expect(scene.getObjectByName('room')).toBeDefined();
    expect(wallColor(scene)).toBe(defaultRoom.wallColor);
  });

  it('recolors the walls when a color is confirmed in the UI', async () => {
    const { scene } = await start();
    setWall('#0000ff');
    expect(wallColor(scene)).toBe(0x0000ff);
  });

  it('replaces the room instead of stacking rooms', async () => {
    const { scene } = await start();
    setWall('#0000ff');
    setWall('#00ff00');
    expect(scene.children.filter((c) => c.name === 'room')).toHaveLength(1);
  });

  it('undoes and redoes with the keyboard shortcuts', async () => {
    const { scene } = await start();
    setWall('#0000ff');

    press({ key: 'z', ctrlKey: true });
    expect(wallColor(scene)).toBe(defaultRoom.wallColor);

    press({ key: 'z', ctrlKey: true, shiftKey: true });
    expect(wallColor(scene)).toBe(0x0000ff);
  });

  it('shows the restored color in the UI after undo', async () => {
    await start();
    setWall('#0000ff');
    press({ key: 'z', ctrlKey: true });
    expect((screen.getByLabelText('Wall hex') as HTMLInputElement).value).toBe('#f2eee6');
  });

  it('undoes the document even while the hex input has focus', async () => {
    const { scene } = await start();
    setWall('#0000ff');
    const input = screen.getByLabelText('Wall hex');
    input.focus();
    press({ key: 'z', ctrlKey: true }, input);
    expect(wallColor(scene)).toBe(defaultRoom.wallColor);
  });

  it('records setColor, undo and redo in the audit log in order', async () => {
    const { store } = await start();
    setWall('#0000ff');
    press({ key: 'z', ctrlKey: true });
    press({ key: 'z', ctrlKey: true, shiftKey: true });
    expect(store.getState().auditLog.map((e) => e.type)).toEqual(['setColor', 'undo', 'redo']);
  });

  it('stops listening to the keyboard after dispose', async () => {
    const { scene, store } = await start();
    setWall('#0000ff');
    dispose?.();
    dispose = undefined;
    press({ key: 'z', ctrlKey: true });
    expect(store.getState().present.wallColor).toBe(0x0000ff); // undo was not applied
    expect(scene.getObjectByName('room')).toBeUndefined(); // dispose removed the room
  });

  it('toggles the draw-wall tool in view state from the button, without touching the document', async () => {
    const { store, view } = await start();
    const button = screen.getByRole('button', { name: 'Draw wall' });
    fireEvent.click(button);
    expect(view.get().tool).toBe('draw-wall');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(store.getState().auditLog).toEqual([]);

    fireEvent.click(button);
    expect(view.get().tool).toBe('select');
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows a wall added to the store as a mesh in the scene', async () => {
    const { scene, store } = await start();
    await act(async () => {
      store.dispatch({
        type: 'addWall',
        args: { wall: { id: 'wall-1', start: { x: 0, z: 0 }, end: { x: 2, z: 0 }, thickness: 0.1 } },
      });
    });
    expect(scene.getObjectByName('wall-1')).toBeDefined();
  });
});
