import type { MathBankTaskSnapshot } from 'common.utils';
import type { BankSubject } from 'features.math.bank';

export const toMathBankTaskSnapshot = (task: {
  id: string;
  grade: number;
  topicId?: string;
  taskType?: string;
  difficulty?: number;
  subject?: BankSubject;
}): MathBankTaskSnapshot => ({
  id: task.id,
  grade: task.grade,
  topicId: task.topicId,
  taskType: task.taskType,
  difficulty: task.difficulty,
  subject: task.subject ?? 'mathematics',
});
