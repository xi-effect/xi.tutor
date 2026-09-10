import type { MathBankTaskSnapshot } from 'common.utils';

export const toMathBankTaskSnapshot = (task: {
  id: string;
  grade: number;
  topicId?: string;
  taskType?: string;
  difficulty?: number;
}): MathBankTaskSnapshot => ({
  id: task.id,
  grade: task.grade,
  topicId: task.topicId,
  taskType: task.taskType,
  difficulty: task.difficulty,
});
