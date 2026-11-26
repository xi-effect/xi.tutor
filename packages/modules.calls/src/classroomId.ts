/**
 * Id кабинета в адресе — положительное целое.
 * Id доски и заметки — UUID: если подставить его в `/call/$callId` или
 * `/board/$boardId`, страница кабинета/звонка отвечает 404.
 */
export const asClassroomId = (value: unknown): string | undefined => {
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || value <= 0) return;
    return String(value);
  }

  if (typeof value !== 'string') return;

  const trimmed = value.trim().replace(/^"|"$/g, '');
  if (!/^[1-9]\d*$/.test(trimmed)) return;
  return trimmed;
};

export const firstClassroomId = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    const id = asClassroomId(value);
    if (id) return id;
  }
  return undefined;
};
