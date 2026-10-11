/**
 * The room document: plain data that is saved, undone and audited. Fields are readonly,
 * so edits go through commands (src/core/commands.ts) instead of mutating in place.
 * All units are meters, Y is up, floor sits at y = 0.
 */
export interface RoomConfig {
  readonly width: number; // x extent
  readonly length: number; // z extent
  readonly height: number;
  readonly wallThickness: number;
  readonly wallColor: number;
  readonly floorColor: number;
}
