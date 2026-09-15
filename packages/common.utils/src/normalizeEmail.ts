/** Email для lookup: trim + нижний регистр. Домен регистронезависимый, локальную часть так же не различаем. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
