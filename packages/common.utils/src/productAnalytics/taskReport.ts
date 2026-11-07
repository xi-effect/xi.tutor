import { PRODUCT_ANALYTICS_EVENTS } from './events';
import type { TaskReportCommentLengthBucket, TaskReportFailureReason } from './types';
import { trackProductEvent } from './umami';

export type TaskReportContext = {
  taskId: string;
  subject: string;
  grade?: string | number;
  topicId?: string;
  taskType?: string;
  source?: string;
};

const reportProps = (context: TaskReportContext) => ({
  event_version: 1 as const,
  task_id: context.taskId,
  subject: context.subject,
  ...(context.grade !== undefined && context.grade !== '' ? { grade: context.grade } : {}),
  ...(context.topicId ? { topic_id: context.topicId } : {}),
  ...(context.taskType ? { task_type: context.taskType } : {}),
  ...(context.source ? { source: context.source } : {}),
});

/** Верхняя граница бакета включена: 300 символов — это `151_300`, длиннее — `300_plus`. */
export const getTaskReportCommentLengthBucket = (
  length: number,
): TaskReportCommentLengthBucket | undefined => {
  if (length <= 0) return undefined;
  if (length <= 50) return '1_50';
  if (length <= 150) return '51_150';
  if (length <= 300) return '151_300';
  return '300_plus';
};

export const trackTaskReportOpened = (context: TaskReportContext) => {
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.TASK_REPORT_OPENED, reportProps(context));
};

/**
 * Метаданные успешного репорта. Текст комментария в payload не входит.
 * `comment` нужен только чтобы посчитать длину на клиенте.
 */
export const trackTaskReportSubmitted = (context: TaskReportContext, comment: string) => {
  const length = comment.trim().length;
  const commentLengthBucket = getTaskReportCommentLengthBucket(length);

  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.TASK_REPORT_SUBMITTED, {
    ...reportProps(context),
    has_comment: length > 0,
    ...(commentLengthBucket ? { comment_length_bucket: commentLengthBucket } : {}),
  });
};

export const trackTaskReportFailed = (
  context: TaskReportContext,
  reason: TaskReportFailureReason,
) => {
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.TASK_REPORT_FAILED, {
    event_version: 1,
    task_id: context.taskId,
    subject: context.subject,
    reason,
  });
};

export const mapTaskReportFailure = (error: unknown): TaskReportFailureReason => {
  if (!error || typeof error !== 'object') return 'unknown';

  const candidate = error as {
    code?: unknown;
    name?: unknown;
    message?: unknown;
    status?: unknown;
    response?: { status?: unknown };
  };

  const status =
    typeof candidate.response?.status === 'number'
      ? candidate.response.status
      : typeof candidate.status === 'number'
        ? candidate.status
        : undefined;

  if (status === 400 || status === 422) return 'validation_error';
  if (typeof status === 'number' && status >= 500) return 'server_error';

  const code = typeof candidate.code === 'string' ? candidate.code : '';
  const name = typeof candidate.name === 'string' ? candidate.name : '';
  const message = typeof candidate.message === 'string' ? candidate.message : '';
  const networkMessage = message === 'Network Error' || message === 'Failed to fetch';
  const fetchFailure =
    name === 'TypeError' && /failed to fetch|networkerror|load failed/i.test(message);

  if (code === 'ERR_NETWORK' || code === 'ECONNABORTED' || networkMessage || fetchFailure) {
    return 'network_error';
  }

  return 'unknown';
};
