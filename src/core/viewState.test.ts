import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { defaultRoom } from '../defaultRoom';
import type { RoomConfig } from '../roomConfig';
import { setColor } from './commands';
import { createStore } from './store';
import { createViewStore } from './viewState';

describe('view store', () => {
  it('starts with nothing selected or hovered and the select tool', () => {
    expect(createViewStore().get()).toEqual({ selectedId: null, hoverId: null, tool: 'select' });
  });

  it('set merges a patch into the state', () => {
    const view = createViewStore();
    view.set({ selectedId: 'wall-north' });
    view.set({ tool: 'move' });
    expect(view.get()).toEqual({ selectedId: 'wall-north', hoverId: null, tool: 'move' });
  });

  it('notifies subscribers on every set', () => {
    const view = createViewStore();
    const listener = vi.fn();
    view.subscribe(listener);
    view.set({ hoverId: 'floor' });
    view.set({ hoverId: null });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('stops notifying after unsubscribe', () => {
    const view = createViewStore();
    const listener = vi.fn();
    const unsubscribe = view.subscribe(listener);
    unsubscribe();
    view.set({ selectedId: 'floor' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('never mutates states it handed out earlier', () => {
    const view = createViewStore();
    const before = view.get();
    view.set({ selectedId: 'floor' });
    expect(before.selectedId).toBeNull();
  });
});

describe('view state vs document state', () => {
  it('a view change leaves the document store, its history and its audit log untouched', () => {
    const store = createStore(defaultRoom);
    store.dispatch(setColor('wallColor', 0xff0000));
    const before = store.getState();
    const listener = vi.fn();
    store.subscribe(listener);

    createViewStore().set({ selectedId: 'wall-east', tool: 'move' });

    expect(store.getState()).toBe(before);
    expect(listener).not.toHaveBeenCalled();
  });

  it('RoomConfig holds no view state', () => {
    expectTypeOf<RoomConfig>().not.toHaveProperty('selectedId');
    expectTypeOf<RoomConfig>().not.toHaveProperty('hoverId');
    expectTypeOf<RoomConfig>().not.toHaveProperty('tool');
    expectTypeOf<RoomConfig>().not.toHaveProperty('camera');
  });
});
