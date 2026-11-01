import { useTranslation } from 'react-i18next';
import { useAppTimeZone } from 'common.ui';
import { getAssignmentStatus } from '../status';
import type { HomeworkItem } from '../types';
import { formatDueDate, formatUpdatedLabel } from '../utils/formatDate';

export const useHomeworkPresentation = (item: HomeworkItem) => {
  const { t } = useTranslation('homework');
  useAppTimeZone();

  const status = getAssignmentStatus(item);
  const description = item.description.trim();

  const assigneeLine =
    item.students.length === 0
      ? t('meta.notAssigned')
      : t('meta.assignees', { count: item.students.length });
  const dueLine = item.dueAt ? t('meta.due', { date: formatDueDate(item.dueAt) }) : '';
  const assignmentLine = dueLine ? `${assigneeLine} · ${dueLine}` : assigneeLine;
  const primaryLine =
    item.kind === 'template' ? t('meta.questions', { count: item.questionCount }) : assignmentLine;

  const createdAt = new Date(item.createdAt).getTime();
  const updatedAt = new Date(item.updatedAt).getTime();
  const dateLine =
    Number.isFinite(createdAt) &&
    Number.isFinite(updatedAt) &&
    Math.abs(updatedAt - createdAt) < 1000
      ? t('meta.created', { date: formatUpdatedLabel(item.createdAt, t) })
      : t('meta.updated', { date: formatUpdatedLabel(item.updatedAt, t) });

  return { status, description, primaryLine, dateLine };
};
