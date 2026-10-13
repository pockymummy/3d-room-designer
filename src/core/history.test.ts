import { describe, expect, it } from 'vitest';
import { commit, createHistory, redo, undo } from './history';

describe('history', () => {
  it('starts with the initial state as present and nothing to undo or redo', () => {
    const h = createHistory('a');
    expect(h).toEqual({ past: [], present: 'a', future: [] });
  });

  it('commit moves the present into the past', () => {
    const h = commit(createHistory('a'), 'b');
    expect(h).toEqual({ past: ['a'], present: 'b', future: [] });
  });

  it('undo restores the previous present and keeps the undone state for redo', () => {
    const h = undo(commit(createHistory('a'), 'b'));
    expect(h).toEqual({ past: [], present: 'a', future: ['b'] });
  });

  it('undo with nothing to undo returns the same history', () => {
    const h = createHistory('a');
    expect(undo(h)).toBe(h);
  });

  it('redo re-applies an undone state', () => {
    const h = redo(undo(commit(createHistory('a'), 'b')));
    expect(h).toEqual({ past: ['a'], present: 'b', future: [] });
  });

  it('redo with nothing to redo returns the same history', () => {
    const h = commit(createHistory('a'), 'b');
    expect(redo(h)).toBe(h);
  });

  it('a new commit after an undo clears the redo stack', () => {
    const h = commit(undo(commit(createHistory('a'), 'b')), 'c');
    expect(h).toEqual({ past: ['a'], present: 'c', future: [] });
  });

  it('steps back through several commits in order', () => {
    let h = createHistory(0);
    for (const n of [1, 2, 3]) h = commit(h, n);
    expect([undo(h).present, undo(undo(h)).present, undo(undo(undo(h))).present]).toEqual([2, 1, 0]);
  });

  it('drops the oldest entry when the cap is exceeded', () => {
    let h = createHistory(0);
    for (const n of [1, 2, 3, 4]) h = commit(h, n, 3);
    expect(h.past).toEqual([1, 2, 3]);
    expect(h.present).toBe(4);
  });

  it('keeps only the newest entry with a cap of 1', () => {
    let h = createHistory(0);
    for (const n of [1, 2, 3]) h = commit(h, n, 1);
    expect(h.past).toEqual([2]);
  });

  it('keeps no past with a cap of 0, so there is nothing to undo', () => {
    const h = commit(createHistory('a'), 'b', 0);
    expect(h).toEqual({ past: [], present: 'b', future: [] });
    expect(undo(h)).toBe(h);
  });

  it('does not mutate the history it is given', () => {
    const h = Object.freeze({ past: Object.freeze(['a']), present: 'b', future: Object.freeze([]) });
    expect(() => commit(h, 'c')).not.toThrow();
    expect(() => undo(h)).not.toThrow();
    expect(h.past).toEqual(['a']);
  });
});
