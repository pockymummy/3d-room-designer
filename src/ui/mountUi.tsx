import { createRoot } from 'react-dom/client';
import type { RoomConfig } from '../room';
import { ColorPanel } from './ColorPanel';

export function mountUi(element: HTMLElement, config: RoomConfig, onChange: () => void) {
  createRoot(element).render(<ColorPanel config={config} onChange={onChange} />);
}
