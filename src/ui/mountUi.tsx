import { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { toggleDrawWall } from '../core/drawWall';
import type { Store } from '../core/store';
import type { ViewStore } from '../core/viewState';
import { ColorPanel } from './ColorPanel';
import { DrawWallButton } from './DrawWallButton';

function App({ store, view }: { store: Store; view: ViewStore }) {
  const { present } = useSyncExternalStore(store.subscribe, store.getState);
  const { tool } = useSyncExternalStore(view.subscribe, view.get);
  return (
    <>
      <DrawWallButton active={tool === 'draw-wall'} onToggle={() => toggleDrawWall(view)} />
      <ColorPanel state={present} dispatch={store.dispatch} />
    </>
  );
}

/** Mounts the UI panels and returns a function that unmounts them. */
export function mountUi(element: HTMLElement, store: Store, view: ViewStore) {
  const root = createRoot(element);
  root.render(<App store={store} view={view} />);
  return () => root.unmount();
}
