import { describe, expect, it } from 'vitest';
import { keyToAction } from './shortcuts';

const key = (k: string, mods: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean } = {}) => ({
  key: k,
  ctrlKey: mods.ctrl ?? false,
  metaKey: mods.meta ?? false,
  shiftKey: mods.shift ?? false,
  altKey: mods.alt ?? false,
});

describe('keyToAction', () => {
  it('maps Ctrl+Z to undo', () => {
    expect(keyToAction(key('z', { ctrl: true }))).toBe('undo');
  });

  it('maps Cmd+Z to undo (macOS)', () => {
    expect(keyToAction(key('z', { meta: true }))).toBe('undo');
  });

  it('maps Ctrl+Shift+Z to redo, whatever case the browser reports', () => {
    expect(keyToAction(key('Z', { ctrl: true, shift: true }))).toBe('redo');
    expect(keyToAction(key('z', { ctrl: true, shift: true }))).toBe('redo');
  });

  it('maps Ctrl+Y to redo', () => {
    expect(keyToAction(key('y', { ctrl: true }))).toBe('redo');
  });

  it('ignores a plain z and other keys', () => {
    expect(keyToAction(key('z'))).toBeNull();
    expect(keyToAction(key('a', { ctrl: true }))).toBeNull();
    expect(keyToAction(key('Enter'))).toBeNull();
  });

  it('ignores Alt combinations', () => {
    expect(keyToAction(key('z', { ctrl: true, alt: true }))).toBeNull();
  });
});
