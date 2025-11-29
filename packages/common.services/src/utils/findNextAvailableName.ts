export const findNextAvailableName = (
  existingMaterials: Array<{ name: string }>,
  kind: 'note' | 'board',
): string => {
  const prefix = kind === 'note' ? 'Новая заметка' : 'Новая доска';
  const pattern = new RegExp(`^${prefix} (\\d+)$`);

  const existingNumbers = existingMaterials
    .map((material) => {
      const match = material.name.match(pattern);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((num) => num > 0);

  const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
  return `${prefix} ${maxNumber + 1}`;
};
