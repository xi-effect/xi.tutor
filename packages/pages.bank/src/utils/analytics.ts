import type { MathBankTaskSnapshot, TaskReportContext } from 'common.utils';
import type { BankSubject } from 'features.bank';

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

export const toTaskReportContext = (
  task: {
    id: string;
    grade: number;
    topicId?: string;
    taskType?: string;
    subject?: string;
  },
  fallbackSubject: string,
  source: string,
): TaskReportContext => ({
  taskId: task.id,
  subject: task.subject || fallbackSubject,
  grade: task.grade,
  ...(task.topicId ? { topicId: task.topicId } : {}),
  ...(task.taskType ? { taskType: task.taskType } : {}),
  source,
});
