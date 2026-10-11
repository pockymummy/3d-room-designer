import type { Command } from './commands';

/** Undo and redo are facts worth recording too; they carry no arguments. */
export type HistoryAction = { type: 'undo' | 'redo' };

/** One thing that happened to the document: what, when and who asked for it. */
export type AuditEntry = (Command | HistoryAction) & { timestamp: number; source: string };

/**
 * The audit log is append-only: it returns a new array and never removes or rewrites
 * entries, even when undo rolls the document back or the history cap drops old states.
 */
export function appendEntry(log: readonly AuditEntry[], entry: AuditEntry): readonly AuditEntry[] {
  return [...log, entry];
}
