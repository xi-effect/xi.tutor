export const formatFileSize = (bytes: number, locale: string): string => {
  const units = locale.startsWith('ru')
    ? (['Б', 'КБ', 'МБ', 'ГБ'] as const)
    : (['B', 'KB', 'MB', 'GB'] as const);

  if (!Number.isFinite(bytes) || bytes < 0) {
    return `0 ${units[0]}`;
  }

  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const formatted = value.toLocaleString(locale.startsWith('ru') ? 'ru-RU' : 'en-US', {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  });

  return `${formatted} ${units[unitIndex]}`;
};
