import type {
  EnglishTask,
  MathTask,
  PhysicsTask,
  RussianTask,
  RussianTaskAnswer,
} from 'features.bank';
import { formatEnglishAnswer } from 'features.bank';

export type BankTask = MathTask | RussianTask | PhysicsTask | EnglishTask;

export const isMathTask = (task: BankTask): task is MathTask => task.subject === 'mathematics';

export const isRussianTask = (task: BankTask): task is RussianTask => task.subject === 'russian';

export const isPhysicsTask = (task: BankTask): task is PhysicsTask => task.subject === 'physics';

export const isEnglishTask = (task: BankTask): task is EnglishTask => task.subject === 'english';

export const formatEnglishAnswerLines = (task: EnglishTask): string[] => {
  if (task.rubric) {
    return [
      ...task.rubric.checklist,
      ...task.rubric.criteria.map(
        (criterion) => `${criterion.name} (${criterion.maxPoints}): ${criterion.guidance}`,
      ),
    ];
  }

  const answer = formatEnglishAnswer(task);
  return answer ? [answer] : [];
};

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
