import { describe, expect, it } from 'vitest';
import { defaultRoom } from '../defaultRoom';
import { layoutRoom } from '../layout';
import type { Wall } from '../roomConfig';
import { addWall, applyCommand, describeCommand, setColor, type Command } from './commands';

const partition: Wall = { id: 'wall-1', start: { x: -1, z: -1 }, end: { x: 1, z: 1 }, thickness: 0.1 };

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
  const samples: Command[] = [
    setColor('wallColor', 0xff0000),
    setColor('floorColor', 0x00ff00),
    addWall(partition),
  ];

  it('describes every command for the audit log', () => {
    for (const cmd of samples) expect(describeCommand(cmd)).toMatch(/\S/);
  });

  it('names the target and the new color', () => {
    expect(describeCommand(setColor('wallColor', 0xff0000))).toBe('Set wallColor to #ff0000');
    expect(describeCommand(setColor('floorColor', 0x0000ff))).toBe('Set floorColor to #0000ff');
  });
});

describe('addWall', () => {
  it('is plain serializable data', () => {
    const cmd = addWall(partition);
    expect(cmd).toEqual({ type: 'addWall', args: { wall: partition } });
    expect(JSON.parse(JSON.stringify(cmd))).toEqual(cmd);
  });

  it('appends the wall and returns a new object', () => {
    const next = applyCommand(defaultRoom, addWall(partition));
    expect(next.walls).toEqual([...defaultRoom.walls, partition]);
    expect(next).not.toBe(defaultRoom);
    expect(defaultRoom.walls).toHaveLength(4);
  });

  it('ignores a wall whose id already exists', () => {
    const once = applyCommand(defaultRoom, addWall(partition));
    expect(applyCommand(once, addWall({ ...partition, end: { x: 9, z: 9 } }))).toBe(once);
  });

  it('is described for the audit log', () => {
    expect(describeCommand(addWall(partition))).toBe('Add wall wall-1');
  });

  it('shows up in the layout with no layout change', () => {
    const parts = layoutRoom(applyCommand(defaultRoom, addWall(partition)));
    const added = parts.find((p) => p.id === 'wall-1');
    expect(parts).toHaveLength(layoutRoom(defaultRoom).length + 1);
    expect(added?.position).toEqual([0, defaultRoom.height / 2, 0]);
    expect(added?.size[0]).toBeCloseTo(Math.hypot(2, 2));
  });
});
