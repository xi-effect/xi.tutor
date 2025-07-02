export const formatDate = (isoDateString: string | undefined): string => {
  if (!isoDateString) return '';

  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return '';

  const formatted = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(date);

  return formatted;
};
