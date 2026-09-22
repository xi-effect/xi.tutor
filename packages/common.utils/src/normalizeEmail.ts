/** Email для отправки: только trim. Регистр нормализует бэкенд. */
export function normalizeEmail(email: string): string {
  return email.trim();
}
