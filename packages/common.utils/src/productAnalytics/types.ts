export type ProductAnalyticsRole = 'tutor' | 'student' | 'parent' | 'unknown';

export type ProductAnalyticsSource =
  | 'main'
  | 'schedule'
  | 'classroom'
  | 'classrooms'
  | 'materials'
  | 'call'
  | 'invite'
  | 'direct'
  | 'unknown';

export type ProductAnalyticsLessonType = 'individual' | 'group' | 'unknown';

export type ProductAnalyticsInviteKind = 'student' | 'group' | 'unknown';

export type ProductAnalyticsCallFailureReason =
  'token_error' | 'connection_error' | 'permission_error' | 'unknown';

export type ProductAnalyticsDurationBucket = '5-15' | '15-30' | '30-45' | '45+';

export type ProductAnalyticsBoardTrigger = 'duration' | 'objects' | 'collaboration';

export type UmamiEventPayload = Record<string, string | number | boolean | null | undefined>;
