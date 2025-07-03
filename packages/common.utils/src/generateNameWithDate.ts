export const generateNameWithDate = (text: string): string => {
  const date = new Date();
  const formattedDate = `${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU')}`;

  return `${text}-${formattedDate}`;
};
