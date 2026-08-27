/**
 * `@xipkg/userprofile` берёт `text[0].toUpperCase()` без проверки —
 * пустая строка роняет страницу. Нельзя отдавать в `UserProfile` имя из пробелов.
 */
export const resolveClassroomNameForProfile = (name: string | null | undefined): string => {
  const trimmed = name?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : '?';
};
