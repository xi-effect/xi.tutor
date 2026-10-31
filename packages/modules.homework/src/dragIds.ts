export const optionDragId = (questionId: string, optionId: string) =>
  `option:${questionId}:${optionId}`;

export const readOptionDrag = (id: string) => {
  const [prefix, questionId, optionId] = id.split(':');
  if (prefix !== 'option' || !questionId || !optionId) return null;
  return { questionId, optionId };
};
