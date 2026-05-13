const STORAGE_KEY = 'xi-tldraw-board-tokens';
/**
 * Сколько токенов держим в реестре. 5 — компромисс между поддержкой
 * cross-board paste и шумом при битых токенах: каждый мёртвый токен
 * в очереди стоит N лишних HTTP-запросов на каждую недоступную картинку.
 */
const MAX_TOKENS = 5;

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
 * Removes a token from the registry. Called when the server confirms
 * the token is dead ("Invalid storage token" / 403) so we stop trying it
 * for any subsequent assets.
 */
export function unregisterToken(token: string): void {
  try {
    const tokens = getRegisteredTokens();
    const filtered = tokens.filter((t) => t !== token);
    if (filtered.length === tokens.length) return;
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
