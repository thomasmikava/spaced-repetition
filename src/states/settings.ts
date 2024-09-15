import { proxy, subscribe } from 'valtio';

const STORAGE_KEY = 'CARD_SETTINGS';

const state = proxy({
  showControls: false,
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as {}),
});

subscribe(state, () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
});

export { state as settingsState };
