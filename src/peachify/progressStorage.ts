import type { PeachifyProgressStore } from './types';

const DEFAULT_STORAGE_KEY = 'peachifyProgress';

export function loadPeachifyProgress(
  storageKey = DEFAULT_STORAGE_KEY,
  storage: Storage = localStorage,
): PeachifyProgressStore {
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as PeachifyProgressStore;
    }
  } catch {
    // Corrupt storage — start fresh
  }
  return {};
}

export function savePeachifyProgress(
  store: PeachifyProgressStore,
  storageKey = DEFAULT_STORAGE_KEY,
  storage: Storage = localStorage,
): void {
  storage.setItem(storageKey, JSON.stringify(store));
}

export function mergePeachifyProgress(
  incoming: PeachifyProgressStore,
  storageKey = DEFAULT_STORAGE_KEY,
  storage: Storage = localStorage,
): PeachifyProgressStore {
  const existing = loadPeachifyProgress(storageKey, storage);
  const merged: PeachifyProgressStore = { ...existing, ...incoming };
  savePeachifyProgress(merged, storageKey, storage);
  return merged;
}

export function getMediaProgress(
  store: PeachifyProgressStore,
  mediaId: string | number,
): PeachifyProgressStore[string] | undefined {
  return store[String(mediaId)];
}

export function getCompletionRatio(entry: {
  progress?: { watched?: number; duration?: number };
}): number {
  const { watched = 0, duration = 0 } = entry.progress ?? {};
  if (!duration || duration <= 0) return 0;
  return Math.min(1, Math.max(0, watched / duration));
}
