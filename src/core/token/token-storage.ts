// Exported so AuthContext can watch cross-tab `storage` events for this key.
export const ACCESS_TOKEN_STORAGE_KEY = "remotesea_access_token";
const STORAGE_KEY = ACCESS_TOKEN_STORAGE_KEY;

// Every access is guarded: Web Storage throws (not returns null) when it's
// disabled or over quota — Safari private mode, locked-down enterprise
// browsers, storage-blocking extensions. getAccessToken() runs in
// AuthProvider's useState initializer at boot, *above* the ErrorBoundary, so an
// unguarded throw here was a white screen on the very first paint. Degrading to
// "no persisted token" keeps the app usable (the session just lives in memory
// for that tab) instead of dead.
const safeRead = (storage: Storage): string | null => {
  try {
    return storage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null =>
  safeRead(localStorage) ?? safeRead(sessionStorage);

export const clearAccessToken = (): void => {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear if storage is unavailable.
    }
  }
};

export const setAccessToken = (token: string, remember: boolean): void => {
  clearAccessToken();
  try {
    (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, token);
  } catch {
    // Storage blocked/full — the caller still holds the token in memory for
    // this session; it just won't survive a reload.
  }
};
