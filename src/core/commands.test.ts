import { describe, expect, it } from 'vitest';
import { defaultRoom } from '../defaultRoom';
import { applyCommand, describeCommand, setColor, type Command } from './commands';

describe('setColor', () => {
  it('is plain serializable data', () => {
    const cmd = setColor('wallColor', 0xff0000);
    expect(cmd).toEqual({ type: 'setColor', args: { key: 'wallColor', value: 0xff0000 } });
    expect(JSON.parse(JSON.stringify(cmd))).toEqual(cmd);
  });
});

describe('applyCommand', () => {
  it('sets the wall color and returns a new object', () => {
    const next = applyCommand(defaultRoom, setColor('wallColor', 0xff0000));
    expect(next.wallColor).toBe(0xff0000);
    expect(next).not.toBe(defaultRoom);
  });

  it('sets the floor color without touching the wall color', () => {
    const next = applyCommand(defaultRoom, setColor('floorColor', 0x00ff00));
    expect(next.floorColor).toBe(0x00ff00);
    expect(next.wallColor).toBe(defaultRoom.wallColor);
  });

  it('does not mutate its input', () => {
    const frozen = Object.freeze({ ...defaultRoom });
    expect(() => applyCommand(frozen, setColor('wallColor', 1))).not.toThrow();
    expect(frozen.wallColor).toBe(defaultRoom.wallColor);
  });

  it('produces plain data that survives a JSON round-trip', () => {
    const next = applyCommand(defaultRoom, setColor('wallColor', 0x123456));
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
  });
});

describe('describeCommand', () => {
  // Add every new command type here; the exhaustive switch in commands.ts makes tsc fail otherwise.
  const samples: Command[] = [setColor('wallColor', 0xff0000), setColor('floorColor', 0x00ff00)];

  it('describes every command for the audit log', () => {
    for (const cmd of samples) expect(describeCommand(cmd)).toMatch(/\S/);
  });

  it('names the target and the new color', () => {
    expect(describeCommand(setColor('wallColor', 0xff0000))).toBe('Set wallColor to #ff0000');
    expect(describeCommand(setColor('floorColor', 0x0000ff))).toBe('Set floorColor to #0000ff');
  });
});
