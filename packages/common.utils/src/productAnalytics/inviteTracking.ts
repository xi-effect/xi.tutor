/**
 * Безопасная связка аналитических событий приглашения между репетитором и учеником
 * без изменения backend: хешируем токен приглашения (code) через SHA-256 и передаём
 * только хеш в Umami. Сырой токен никогда не логируется и не сохраняется в свойствах.
 */
export async function createInviteTrackingId(token: string): Promise<string> {
  const normalizedToken = token.trim();
  const data = new TextEncoder().encode(normalizedToken);
  const hash = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Возвращает `invite_tracking_id` для события или `undefined`, если токен отсутствует
 * либо Web Crypto недоступен (например, в не-HTTPS/тестовом окружении) — аналитика
 * не должна ломать пользовательский сценарий.
 */
export async function getInviteTrackingId(token?: string | null): Promise<string | undefined> {
  const normalizedToken = token?.trim();
  if (!normalizedToken) return undefined;

  try {
    if (typeof crypto === 'undefined' || typeof crypto.subtle?.digest !== 'function') {
      return undefined;
    }

    return await createInviteTrackingId(normalizedToken);
  } catch {
    return undefined;
  }
}
