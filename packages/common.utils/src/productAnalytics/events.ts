export const PRODUCT_ANALYTICS_EVENTS = {
  STUDENT_INVITED_SUCCESS: 'student_invited_success',
  INVITE_ACCEPTED_SUCCESS: 'invite_accepted_success',
  LESSON_CREATED_SUCCESS: 'lesson_created_success',
  LESSON_STARTED: 'lesson_started',
  LESSON_JOINED: 'lesson_joined',
  LESSON_DURATION_REACHED: 'lesson_duration_reached',
  LESSON_FINISHED: 'lesson_finished',
  CALL_CONNECTED: 'call_connected',
  CALL_CONNECTION_FAILED: 'call_connection_failed',
  BOARD_OPENED: 'board_opened',
  BOARD_USED_MEANINGFULLY: 'board_used_meaningfully',
} as const;

export type ProductAnalyticsEventName =
  (typeof PRODUCT_ANALYTICS_EVENTS)[keyof typeof PRODUCT_ANALYTICS_EVENTS];
