import type { RoomConfig, Wall } from '../roomConfig';

export type ColorKey = 'wallColor' | 'floorColor';

/**
 * Edits to the room document, as plain serializable data (so they can go in the audit
 * log and be replayed). Add new edits to this union; the switches below must handle them.
 */
export type Command =
  | { type: 'setColor'; args: { key: ColorKey; value: number } }
  | { type: 'addWall'; args: { wall: Wall } };

export const setColor = (key: ColorKey, value: number): Command => ({
  type: 'setColor',
  args: { key, value },
});

export const addWall = (wall: Wall): Command => ({ type: 'addWall', args: { wall } });

function assertNever(x: never): never {
  throw new Error(`Unhandled command: ${JSON.stringify(x)}`);
}

/** Pure: returns a new config and never touches the one it is given. */
export function applyCommand(config: Readonly<RoomConfig>, cmd: Command): RoomConfig {
  switch (cmd.type) {
    case 'setColor':
      if (config[cmd.args.key] === cmd.args.value) return config as RoomConfig;
      return { ...config, [cmd.args.key]: cmd.args.value };
    case 'addWall':
      if (config.walls.some((w) => w.id === cmd.args.wall.id)) return config as RoomConfig;
      return { ...config, walls: [...config.walls, cmd.args.wall] };
    default:
      return assertNever(cmd);
  }
}

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

export function describeCommand(cmd: Command): string {
  switch (cmd.type) {
    case 'setColor':
      return `Set ${cmd.args.key} to ${hex(cmd.args.value)}`;
    case 'addWall':
      return `Add wall ${cmd.args.wall.id}`;
    default:
      return assertNever(cmd);
  }
}
