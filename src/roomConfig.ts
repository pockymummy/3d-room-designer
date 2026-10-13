/** A point on the floor plane, in meters. */
export interface Point {
  readonly x: number;
  readonly z: number;
}

/**
 * A wall: the centerline segment from `start` to `end`, `thickness` wide. Ids are stable and
 * unique within a room, and are the mesh names, so selection survives other edits.
 */
export interface Wall {
  readonly id: string;
  readonly start: Point;
  readonly end: Point;
  readonly thickness: number;
}

/**
 * The room document: plain data that is saved, undone and audited. Fields are readonly,
 * so edits go through commands (src/core/commands.ts) instead of mutating in place.
 * All units are meters, Y is up, floor sits at y = 0.
 */
export interface RoomConfig {
  readonly height: number;
  /** The floor rectangle, centered on the origin: width on x, length on z. */
  readonly floor: { readonly width: number; readonly length: number };
  readonly walls: readonly Wall[];
  readonly wallColor: number;
  readonly floorColor: number;
}
