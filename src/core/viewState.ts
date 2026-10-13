import type { PartId } from '../layout';
import type { Point } from '../roomConfig';

/**
 * How the user is looking at and pointing at the room right now. Never saved, never
 * undoable, never in the audit log; it lives apart from the document (RoomConfig).
 * The camera is owned by OrbitControls and is not mirrored here.
 */
export interface ViewState {
  readonly selectedId: PartId | null;
  readonly hoverId: PartId | null;
  readonly tool: 'select' | 'move' | 'draw-wall';
  /** The first click of a wall being drawn; the wall is not in the document until the second. */
  readonly wallStart: Point | null;
}

export interface ViewStore {
  get(): ViewState;
  set(patch: Partial<ViewState>): void;
  subscribe(listener: () => void): () => void;
}

export function createViewStore(
  initial: ViewState = { selectedId: null, hoverId: null, tool: 'select', wallStart: null },
): ViewStore {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    get: () => state,
    set(patch) {
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
