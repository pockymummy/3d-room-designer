import { useState, type KeyboardEvent } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { setColor, type ColorKey, type Command } from '../core/commands';
import type { RoomConfig } from '../roomConfig';

const toHex = (n: number) => '#' + n.toString(16).padStart(6, '0');

/** Accepts `#rgb` and `#rrggbb`. */
const parseHex = (hex: string) => {
  const digits = hex.replace('#', '');
  const full = digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits;
  return parseInt(full, 16);
};

interface FieldProps {
  label: string;
  value: number;
  onCommit: (value: number) => void;
}

/**
 * One color control. The picker and the hex box fire `onChange` continuously while the
 * user drags or types, so those steps only update a local draft. The color is committed
 * (one dispatch, one undo step) when the gesture ends: pointer/key release on the picker,
 * Enter or blur on the hex box.
 */
function ColorField({ label, value, onCommit }: FieldProps) {
  // null means "show the document's color"; it is also how undo/redo reaches the display.
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? toHex(value);

  const commit = (hex: string) => {
    setDraft(null);
    const next = parseHex(hex);
    if (next !== value) onCommit(next);
  };

  const commitDraft = () => {
    if (draft !== null) commit(draft);
  };

  return (
    <div role="group" aria-label={`${label} color`} className="color-field">
      <span>{label}</span>
      <HexColorPicker color={shown} onChange={setDraft} onChangeEnd={commit} />
      <HexColorInput
        prefixed
        aria-label={`${label} hex`}
        color={shown}
        onChange={setDraft}
        onBlur={commitDraft}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') commitDraft();
        }}
      />
    </div>
  );
}

interface Props {
  state: RoomConfig;
  dispatch: (command: Command) => void;
}

export function ColorPanel({ state, dispatch }: Props) {
  const field = (label: string, key: ColorKey) => (
    <ColorField label={label} value={state[key]} onCommit={(value) => dispatch(setColor(key, value))} />
  );

  return (
    <>
      {field('Wall', 'wallColor')}
      {field('Floor', 'floorColor')}
    </>
  );
}
