/** Snapshot history: every entry is a whole state, so undo can only restore states that existed. */
export interface History<T> {
  readonly past: readonly T[];
  readonly present: T;
  readonly future: readonly T[];
}

export const DEFAULT_HISTORY_CAP = 100;

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [] };
}

/**
 * Makes `next` the present; the old present becomes undoable and any redo is discarded.
 * Only the newest `cap` past states are kept.
 */
export function commit<T>(h: History<T>, next: T, cap = DEFAULT_HISTORY_CAP): History<T> {
  return { past: [...h.past, h.present].slice(-cap), present: next, future: [] };
}

export function undo<T>(h: History<T>): History<T> {
  if (h.past.length === 0) return h;
  const previous = h.past[h.past.length - 1] as T;
  return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future] };
}

export function redo<T>(h: History<T>): History<T> {
  if (h.future.length === 0) return h;
  const [next, ...future] = h.future as [T, ...T[]];
  return { past: [...h.past, h.present], present: next, future };
}
