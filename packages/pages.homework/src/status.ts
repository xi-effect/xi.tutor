import type { AssignmentStatus, HomeworkItem } from './types';

/**
 * На карточке один статус — самый срочный для репетитора.
 * Проверка важнее просрочки: сданные работы ждут действия прямо сейчас.
 */
const STATUS_PRIORITY: AssignmentStatus[] = [
  'awaiting_review',
  'overdue',
  'assigned',
  'draft',
  'completed',
];

export const homeworkStatusBadgeClass: Record<AssignmentStatus, string> = {
  draft: 'text-text-primary bg-background-subtle',
  assigned: 'text-text-link bg-status-info-background',
  awaiting_review: 'text-tag-orange-accent bg-tag-orange-background',
  overdue: 'text-text-danger bg-status-error-background',
  completed: 'text-status-success-text bg-status-success-background',
};

export const getAssignmentStatus = (
  item: HomeworkItem,
  now: Date = new Date(),
): AssignmentStatus | null => {
  if (item.kind !== 'assignment') {
    return null;
  }

  const students = item.students;
  if (students.length === 0) {
    return 'draft';
  }

  const hasWorkToReview = students.some((student) => student.state === 'submitted');
  const hasMissingWork = students.some((student) => student.state === 'not_submitted');
  const allReviewed = students.every((student) => student.state === 'reviewed');
  const dueAt = item.dueAt ? new Date(item.dueAt) : null;
  const isOverdue =
    dueAt != null && !Number.isNaN(dueAt.getTime()) && dueAt.getTime() < now.getTime();

  const candidates: AssignmentStatus[] = [];
  if (hasWorkToReview) candidates.push('awaiting_review');
  if (isOverdue && hasMissingWork) candidates.push('overdue');
  if (allReviewed) candidates.push('completed');
  if (!allReviewed) candidates.push('assigned');

  return STATUS_PRIORITY.find((status) => candidates.includes(status)) ?? 'assigned';
};
