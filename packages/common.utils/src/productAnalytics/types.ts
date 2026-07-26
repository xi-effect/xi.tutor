export type ProductAnalyticsRole = 'tutor' | 'student' | 'parent' | 'unknown';

export type ProductAnalyticsActorRole = 'tutor' | 'student';

export type ProductAnalyticsSource =
  | 'main'
  | 'schedule'
  | 'classroom'
  | 'classrooms'
  | 'materials'
  | 'call'
  | 'invite'
  | 'onboarding'
  | 'students'
  | 'lesson'
  | 'quick_action'
  | 'direct'
  | 'direct_link'
  | 'notification'
  | 'landing'
  | 'login'
  | 'unknown';

export type SignupEntryPoint = 'landing' | 'invite' | 'login' | 'direct' | 'unknown';

export type ProductAnalyticsLessonType = 'individual' | 'group' | 'unknown';

export type ProductAnalyticsInviteKind = 'student' | 'group' | 'unknown';

export type ProductAnalyticsCallFailureReason =
  'token_error' | 'connection_error' | 'permission_error' | 'unknown';

export type CallFailureReason =
  | 'token_error'
  | 'permission_error'
  | 'network_error'
  | 'timeout'
  | 'ice_failed'
  | 'server_unavailable'
  | 'unsupported_browser'
  | 'unknown';

export type SignupFailureReason =
  | 'email_exists'
  | 'username_exists'
  | 'network_error'
  | 'timeout'
  | 'rate_limited'
  | 'server_error'
  | 'unknown';

export type SignupValidationFailureReason =
  'required_field' | 'invalid_email' | 'weak_password' | 'terms_not_accepted' | 'multiple_fields';

export type ActivationHelpReason = 'need_help' | 'stuck_on_step' | 'contact_support' | 'unknown';

export type EmailConfirmationSource = 'signup' | 'session_restore' | 'email_link' | 'unknown';

export type EmailConfirmationFailureReason =
  'expired' | 'invalid_token' | 'already_confirmed' | 'network_error' | 'server_error' | 'unknown';

export type InviteFailureReason =
  'limit_reached' | 'invalid_data' | 'network_error' | 'server_error' | 'unknown';

export type LessonCreateFailureReason =
  | 'no_students'
  | 'invalid_time'
  | 'schedule_conflict'
  | 'validation_error'
  | 'network_error'
  | 'server_error'
  | 'unknown';

export type PermissionFailureReason =
  'user_denied' | 'browser_blocked' | 'device_missing' | 'device_busy' | 'unsupported' | 'unknown';

export type HttpStatusGroup = '4xx' | '5xx' | 'none';

export type OnboardingStepName =
  'email_confirmation' | 'profile' | 'role_selection' | 'notifications' | 'training' | 'completed';

export type OnboardingStepFailReason =
  'validation_error' | 'network_error' | 'server_error' | 'unknown';

export type OnboardingSkipReason = 'later' | 'dismiss' | 'no_steps' | 'unknown';

export type MediaType = 'camera' | 'microphone' | 'camera_and_microphone';

export type LessonDurationThreshold = 5 | 15 | 30 | 45 | 60;

export type LessonFinishReason =
  'user_left' | 'lesson_ended' | 'connection_lost' | 'browser_closed' | 'kicked' | 'unknown';

export type ActivationHelpScreen =
  | 'signup'
  | 'email_confirmation'
  | 'onboarding'
  | 'student_invite'
  | 'lesson_create'
  | 'prejoin'
  | 'call';

export type ProductAnalyticsDurationBucket = '5-15' | '15-30' | '30-45' | '45+';

export type ProductAnalyticsBoardTrigger = 'duration' | 'objects' | 'collaboration';

export type UmamiEventPayload = Record<string, string | number | boolean | null | undefined>;

export type CommonActivationProperties = {
  event_version?: number;
  activation_flow_id?: string;
  user_role?: ProductAnalyticsRole;
  onboarding_stage?: string;
  entry_point?: string;
};
