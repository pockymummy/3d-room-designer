import { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import type { Store } from '../core/store';
import { ColorPanel } from './ColorPanel';

function App({ store }: { store: Store }) {
  const { present } = useSyncExternalStore(store.subscribe, store.getState);
  return <ColorPanel state={present} dispatch={store.dispatch} />;
}

/** Mounts the UI panels and returns a function that unmounts them. */
export function mountUi(element: HTMLElement, store: Store) {
  const root = createRoot(element);
  root.render(<App store={store} />);
  return () => root.unmount();
}
