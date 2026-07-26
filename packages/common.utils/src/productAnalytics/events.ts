export const PRODUCT_ANALYTICS_EVENTS = {
  // Auth / signup
  AUTH_SIGNUP_VIEWED: 'auth_signup_viewed',
  AUTH_SIGNUP_SUBMIT: 'auth_signup_submit',
  AUTH_SIGNUP_VALIDATION_FAILED: 'auth_signup_validation_failed',
  AUTH_SIGNUP_SUCCEEDED: 'auth_signup_succeeded',
  AUTH_SIGNUP_FAILED: 'auth_signup_failed',
  AUTH_FIRST_AUTHENTICATED_SESSION: 'auth_first_authenticated_session',

  // Email confirmation
  EMAIL_CONFIRMATION_VIEWED: 'email_confirmation_viewed',
  EMAIL_CONFIRMATION_RESEND_SUBMIT: 'email_confirmation_resend_submit',
  EMAIL_CONFIRMATION_RESEND_SUCCEEDED: 'email_confirmation_resend_succeeded',
  EMAIL_CONFIRMATION_RESEND_FAILED: 'email_confirmation_resend_failed',
  EMAIL_CONFIRMATION_RESEND_BLOCKED: 'email_confirmation_resend_blocked',
  EMAIL_CONFIRMATION_SUCCEEDED: 'email_confirmation_succeeded',
  EMAIL_CONFIRMATION_FAILED: 'email_confirmation_failed',
  EMAIL_CONFIRMATION_CONTINUE_CLICKED: 'email_confirmation_continue_clicked',

  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_VIEWED: 'onboarding_step_viewed',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_STEP_SKIPPED: 'onboarding_step_skipped',
  ONBOARDING_STEP_FAILED: 'onboarding_step_failed',
  ONBOARDING_STEP_BACK: 'onboarding_step_back',
  ONBOARDING_COMPLETED: 'onboarding_completed',

  // Student invite (tutor)
  STUDENT_INVITE_VIEWED: 'student_invite_viewed',
  STUDENT_INVITE_SUBMIT: 'student_invite_submit',
  STUDENT_INVITED_SUCCESS: 'student_invited_success',
  STUDENT_INVITE_FAILED: 'student_invite_failed',
  STUDENT_INVITE_LINK_COPIED: 'student_invite_link_copied',
  STUDENT_INVITE_SHARED: 'student_invite_shared',

  // Student invite (student)
  STUDENT_INVITE_OPENED: 'student_invite_opened',
  STUDENT_INVITE_ACCEPT_SUBMIT: 'student_invite_accept_submit',
  INVITE_ACCEPTED_SUCCESS: 'invite_accepted_success',
  STUDENT_INVITE_ACCEPT_FAILED: 'student_invite_accept_failed',

  // Lesson create
  LESSON_CREATE_VIEWED: 'lesson_create_viewed',
  LESSON_CREATE_SUBMIT: 'lesson_create_submit',
  LESSON_CREATED_SUCCESS: 'lesson_created_success',
  LESSON_CREATE_FAILED: 'lesson_create_failed',

  // Lesson / call lifecycle
  LESSON_OPENED: 'lesson_opened',
  PREJOIN_VIEWED: 'prejoin_viewed',
  LESSON_STARTED: 'lesson_started',
  LESSON_JOINED: 'lesson_joined',
  LESSON_DURATION_REACHED: 'lesson_duration_reached',
  LESSON_FINISHED: 'lesson_finished',

  // Media permissions
  MEDIA_PERMISSION_REQUESTED: 'media_permission_requested',
  MEDIA_PERMISSION_GRANTED: 'media_permission_granted',
  MEDIA_PERMISSION_DENIED: 'media_permission_denied',
  MEDIA_DEVICE_UNAVAILABLE: 'media_device_unavailable',
  MEDIA_PERMISSION_HELP_OPENED: 'media_permission_help_opened',

  // Call connection
  CALL_CONNECT_ATTEMPTED: 'call_connect_attempted',
  CALL_CONNECTED: 'call_connected',
  CALL_CONNECTION_FAILED: 'call_connection_failed',

  // Board (existing)
  BOARD_OPENED: 'board_opened',
  BOARD_USED_MEANINGFULLY: 'board_used_meaningfully',

  // Activation help (P1)
  ACTIVATION_HELP_OPENED: 'activation_help_opened',
  ACTIVATION_SUPPORT_CONTACTED: 'activation_support_contacted',
  ACTIVATION_TUTORIAL_STARTED: 'activation_tutorial_started',
  ACTIVATION_TUTORIAL_COMPLETED: 'activation_tutorial_completed',
} as const;

export type ProductAnalyticsEventName =
  (typeof PRODUCT_ANALYTICS_EVENTS)[keyof typeof PRODUCT_ANALYTICS_EVENTS];

/** Устаревшие declarative-события (data-umami-event). Пока не удаляем. */
export const DEPRECATED_ANALYTICS_EVENTS = {
  AUTH_SIGNUP_BUTTON: 'auth-signup-button',
} as const;
