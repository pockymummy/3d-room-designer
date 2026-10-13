import { describe, expect, it, vi } from 'vitest';
import { defaultRoom } from '../defaultRoom';
import { setColor } from './commands';
import { createStore } from './store';

const makeStore = (options = {}) => {
  let clock = 1000;
  return createStore(defaultRoom, { now: () => clock++, ...options });
};

describe('store dispatch', () => {
  it('starts with the initial room and an empty audit log', () => {
    const store = makeStore();
    expect(store.getState().present).toEqual(defaultRoom);
    expect(store.getState().auditLog).toEqual([]);
  });

  it('applies the command to the present', () => {
    const store = makeStore();
    store.dispatch(setColor('wallColor', 0xff0000));
    expect(store.getState().present.wallColor).toBe(0xff0000);
    expect(store.getState().present.floorColor).toBe(defaultRoom.floorColor);
  });

  it('appends exactly one audit entry with the command, timestamp and source', () => {
    const store = makeStore();
    store.dispatch(setColor('wallColor', 0xff0000), 'color-panel');
    expect(store.getState().auditLog).toEqual([
      {
        type: 'setColor',
        args: { key: 'wallColor', value: 0xff0000 },
        timestamp: 1000,
        source: 'color-panel',
      },
    ]);
  });

  it('defaults the source to "ui"', () => {
    const store = makeStore();
    store.dispatch(setColor('wallColor', 1));
    expect(store.getState().auditLog[0]?.source).toBe('ui');
  });

  it('notifies subscribers once per dispatch', () => {
    const store = makeStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch(setColor('wallColor', 1));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('ignores a command that changes nothing: no undo step, audit entry or notification', () => {
    const store = makeStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch(setColor('wallColor', defaultRoom.wallColor));
    expect(store.getState().canUndo).toBe(false);
    expect(store.getState().auditLog).toEqual([]);
    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying after unsubscribe', () => {
    const store = makeStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.dispatch(setColor('wallColor', 1));
    expect(listener).not.toHaveBeenCalled();
  });

  it('never mutates states it handed out earlier', () => {
    const store = makeStore();
    const before = store.getState();
    store.dispatch(setColor('wallColor', 0xff0000));
    expect(before.present.wallColor).toBe(defaultRoom.wallColor);
    expect(before.auditLog).toHaveLength(0);
  });

  it('keeps audit entries serializable', () => {
    const store = makeStore();
    store.dispatch(setColor('wallColor', 1));
    const log = store.getState().auditLog;
    expect(JSON.parse(JSON.stringify(log))).toEqual(log);
  });
});

describe('store undo and redo', () => {
  it('undo restores the previous room', () => {
    const store = makeStore();
    store.dispatch(setColor('wallColor', 0xff0000));
    store.undo();
    expect(store.getState().present).toEqual(defaultRoom);
  });

  it('redo re-applies the undone change', () => {
    const store = makeStore();
    store.dispatch(setColor('wallColor', 0xff0000));
    store.undo();
    store.redo();
    expect(store.getState().present.wallColor).toBe(0xff0000);
  });

  it('records undo and redo in the audit log without removing earlier entries', () => {
    const store = makeStore();
    store.dispatch(setColor('wallColor', 0xff0000));
    store.undo('shortcut');
    store.redo('shortcut');
    expect(store.getState().auditLog.map((e) => [e.type, e.source])).toEqual([
      ['setColor', 'ui'],
      ['undo', 'shortcut'],
      ['redo', 'shortcut'],
    ]);
  });

  it('notifies subscribers on undo and redo', () => {
    const store = makeStore();
    store.dispatch(setColor('wallColor', 1));
    const listener = vi.fn();
    store.subscribe(listener);
    store.undo();
    store.redo();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('does nothing when there is nothing to undo or redo', () => {
    const store = makeStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.undo();
    store.redo();
    expect(listener).not.toHaveBeenCalled();
    expect(store.getState().auditLog).toEqual([]);
  });

  it('clears redo when a new command follows an undo', () => {
    const store = makeStore();
    store.dispatch(setColor('wallColor', 1));
    store.undo();
    store.dispatch(setColor('wallColor', 2));
    store.redo();
    expect(store.getState().present.wallColor).toBe(2);
  });

  it('reports whether undo and redo are available', () => {
    const store = makeStore();
    expect(store.getState()).toMatchObject({ canUndo: false, canRedo: false });
    store.dispatch(setColor('wallColor', 1));
    expect(store.getState()).toMatchObject({ canUndo: true, canRedo: false });
    store.undo();
    expect(store.getState()).toMatchObject({ canUndo: false, canRedo: true });
  });
});

describe('store history cap', () => {
  it('limits how far back undo goes but never trims the audit log', () => {
    const store = makeStore({ historyCap: 2 });
    for (const n of [1, 2, 3, 4]) store.dispatch(setColor('wallColor', n));
    store.undo();
    store.undo();
    store.undo(); // nothing left: the cap dropped older states
    expect(store.getState().present.wallColor).toBe(2);
    expect(store.getState().auditLog.filter((e) => e.type === 'setColor')).toHaveLength(4);
  });
});
