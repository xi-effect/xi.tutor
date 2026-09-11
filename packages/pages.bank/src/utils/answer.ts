import type { MathTask, RussianTask, RussianTaskAnswer } from 'features.math.bank';

export const isMathTask = (task: MathTask | RussianTask): task is MathTask =>
  task.subject === 'mathematics';

export const isRussianTask = (task: MathTask | RussianTask): task is RussianTask =>
  task.subject === 'russian';

const optionAt = (options: string[] | undefined, index: number) => {
  const option = options?.[index - 1];
  return option ? `${index}. ${option}` : String(index);
};

export const formatRussianAnswerLines = (
  answer: RussianTaskAnswer,
  options?: string[],
): string[] => {
  switch (answer.kind) {
    case 'text':
      return [answer.value];
    case 'text_set':
      return [answer.value.join('; ')];
    case 'choice':
      return [optionAt(options, answer.value)];
    case 'multi_choice':
      return answer.value.map((value) => optionAt(options, value));
    case 'rubric':
      return [...answer.keyPoints, ...answer.rubric];
  }
};
