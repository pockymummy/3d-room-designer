import type { RoomConfig } from '../roomConfig';
import { appendEntry, type AuditEntry, type HistoryAction } from './auditLog';
import { applyCommand, type Command } from './commands';
import { commit, createHistory, DEFAULT_HISTORY_CAP, redo, undo, type History } from './history';

export interface StoreOptions {
  /** Clock for audit timestamps; injectable so tests are deterministic. */
  now?: () => number;
  historyCap?: number;
}

export interface StoreState {
  readonly present: RoomConfig;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly auditLog: readonly AuditEntry[];
}

export interface Store {
  getState(): StoreState;
  dispatch(command: Command, source?: string): void;
  undo(source?: string): void;
  redo(source?: string): void;
  subscribe(listener: () => void): () => void;
}

/** Holds the document (with undo history) and the audit log. Pure TS: no DOM, no three.js. */
export function createStore(initial: RoomConfig, options: StoreOptions = {}): Store {
  const { now = Date.now, historyCap = DEFAULT_HISTORY_CAP } = options;
  let history: History<RoomConfig> = createHistory(initial);
  let auditLog: readonly AuditEntry[] = [];
  let state = snapshot();
  const listeners = new Set<() => void>();

  function snapshot(): StoreState {
    return {
      present: history.present,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      auditLog,
    };
  }

  function record(entry: Command | HistoryAction, source: string) {
    auditLog = appendEntry(auditLog, { ...entry, timestamp: now(), source });
    state = snapshot();
    listeners.forEach((listener) => listener());
  }

  return {
    getState: () => state,
    dispatch(command, source = 'ui') {
      const next = applyCommand(history.present, command);
      if (next === history.present) return; // no change: no undo step, audit entry or rebuild
      history = commit(history, next, historyCap);
      record(command, source);
    },
    undo(source = 'ui') {
      if (history.past.length === 0) return;
      history = undo(history);
      record({ type: 'undo' }, source);
    },
    redo(source = 'ui') {
      if (history.future.length === 0) return;
      history = redo(history);
      record({ type: 'redo' }, source);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
