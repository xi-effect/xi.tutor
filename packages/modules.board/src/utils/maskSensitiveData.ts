/**
 * Утилиты для безопасного логирования чувствительных данных
 */

/**
 * Маскирует токен, оставляя только первые 4 символа и длину
 */
export function maskToken(token: string | undefined): string {
  if (!token) return 'undefined';
  if (token.length <= 6) return '***';
  return `${token.substring(0, 4)}...(${token.length})`;
}

/**
 * Маскирует URL, оставляя только hostname
 */
export function maskUrl(url: string | undefined): string {
  if (!url) return 'undefined';
  try {
    const urlObj = new URL(url);
    return urlObj.hostname || url;
  } catch {
    // Если не валидный URL, показываем только первые 20 символов
    return url.length > 20 ? `${url.substring(0, 20)}...` : url;
  }
}

/**
 * Маскирует ID, оставляя только первые символы
 */
export function maskId(id: string | undefined): string {
  if (!id) return 'undefined';
  if (id.length <= 10) return id.substring(0, 4) + '***';
  return `${id.substring(0, 8)}...(${id.length})`;
}
