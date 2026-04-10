const STORAGE_KEY = 'xi-tldraw-board-tokens';
const MAX_TOKENS = 20;

/**
 * Stores a board's x-storage-token in localStorage so that other boards
 * (including in other tabs) can use it to download files that belong to
 * that board. Most-recently-used token is first.
 */
export function registerToken(token: string): void {
  try {
    const tokens = getRegisteredTokens();
    const filtered = tokens.filter((t) => t !== token);
    filtered.unshift(token);
    while (filtered.length > MAX_TOKENS) filtered.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    /* localStorage full or unavailable */
  }
}

/**
 * Returns all known board tokens (most-recently-used first).
 */
export function getRegisteredTokens(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}
