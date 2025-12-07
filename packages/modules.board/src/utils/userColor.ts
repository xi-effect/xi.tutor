/**
 * Генерация цвета пользователя на основе его ID
 */

/**
 * Генерирует HSL цвет на основе хеша строки userId
 */
export function generateUserColor(userId: string): string {
  const hash = Array.from(userId).reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}
