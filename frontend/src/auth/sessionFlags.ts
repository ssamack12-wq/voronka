const LOGOUT_FLAG_KEY = 'tn-logged-out';

function readFlagStorage(): Storage | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

export function markLoggedOut(): void {
  const storage = readFlagStorage();
  if (!storage) return;
  try {
    storage.setItem(LOGOUT_FLAG_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function clearLoggedOutFlag(): void {
  const storage = readFlagStorage();
  if (!storage) return;
  try {
    storage.removeItem(LOGOUT_FLAG_KEY);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(LOGOUT_FLAG_KEY);
  } catch {
    /* ignore */
  }
}

export function isLoggedOutLocally(): boolean {
  const storage = readFlagStorage();
  if (!storage) return false;
  try {
    if (storage.getItem(LOGOUT_FLAG_KEY)) return true;
    if (sessionStorage.getItem(LOGOUT_FLAG_KEY)) return true;
  } catch {
    return false;
  }
  return false;
}
