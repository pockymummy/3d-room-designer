import { useState } from 'react';
import type { RoomConfig } from '../room';

type ColorKey = 'wallColor' | 'floorColor';

const toHex = (n: number) => '#' + n.toString(16).padStart(6, '0');

interface Props {
  config: RoomConfig;
  onChange: () => void;
}

export function ColorPanel({ config, onChange }: Props) {
  const [hex, setHex] = useState({
    wallColor: toHex(config.wallColor),
    floorColor: toHex(config.floorColor),
  });

  const update = (key: ColorKey, value: string) => {
    setHex((prev) => ({ ...prev, [key]: value }));
    config[key] = parseInt(value.slice(1), 16);
    onChange();
  };

  return (
    <>
      <label>
        Wall
        <input type="color" value={hex.wallColor} onChange={(e) => update('wallColor', e.target.value)} />
      </label>
      <label>
        Floor
        <input type="color" value={hex.floorColor} onChange={(e) => update('floorColor', e.target.value)} />
      </label>
    </>
  );
}
