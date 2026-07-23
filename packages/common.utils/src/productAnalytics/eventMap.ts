import type { PRODUCT_ANALYTICS_EVENTS } from './events';
import type {
  ActivationHelpReason,
  ActivationHelpScreen,
  CallFailureReason,
  CommonActivationProperties,
  EmailConfirmationFailureReason,
  EmailConfirmationSource,
  HttpStatusGroup,
  InviteFailureReason,
  LessonCreateFailureReason,
  LessonDurationThreshold,
  LessonFinishReason,
  MediaType,
  OnboardingSkipReason,
  OnboardingStepFailReason,
  OnboardingStepName,
  PermissionFailureReason,
  ProductAnalyticsActorRole,
  ProductAnalyticsBoardTrigger,
  ProductAnalyticsDurationBucket,
  ProductAnalyticsInviteKind,
  ProductAnalyticsLessonType,
  ProductAnalyticsRole,
  ProductAnalyticsSource,
  SignupEntryPoint,
  SignupFailureReason,
  SignupValidationFailureReason,
} from './types';

type BaseProps = CommonActivationProperties;

type EventName = (typeof PRODUCT_ANALYTICS_EVENTS)[keyof typeof PRODUCT_ANALYTICS_EVENTS];

export type ProductAnalyticsEventMap = {
  auth_signup_viewed: BaseProps & {
    entry_point: SignupEntryPoint;
    has_invite?: boolean;
  };
  auth_signup_submit: BaseProps & {
    attempt_id: string;
    entry_point: string;
    attempt_number?: number;
    has_invite?: boolean;
  };
  auth_signup_validation_failed: BaseProps & {
    reason: SignupValidationFailureReason;
    field: 'name' | 'email' | 'password' | 'terms' | 'multiple';
    entry_point?: string;
    has_invite?: boolean;
  };
  auth_signup_succeeded: BaseProps & {
    attempt_id: string;
    entry_point: string;
    duration_ms: number;
    confirmation_required: boolean;
    attempt_number?: number;
    has_invite?: boolean;
  };
  auth_signup_failed: BaseProps & {
    attempt_id: string;
    reason: SignupFailureReason;
    duration_ms: number;
    http_status_group: HttpStatusGroup;
    entry_point?: string;
    attempt_number?: number;
    has_invite?: boolean;
  };
  auth_first_authenticated_session: BaseProps & {
    user_role: 'tutor' | 'student';
    source: 'signup' | 'login' | 'invite';
  };

  email_confirmation_viewed: BaseProps & {
    source?: EmailConfirmationSource;
    onboarding_stage?: string;
  };
  email_confirmation_resend_submit: BaseProps & {
    attempt_id: string;
    attempt_number?: number;
    source?: EmailConfirmationSource;
  };
  email_confirmation_resend_succeeded: BaseProps & {
    attempt_id: string;
    duration_ms: number;
    attempt_number?: number;
    source?: EmailConfirmationSource;
  };
  email_confirmation_resend_failed: BaseProps & {
    attempt_id: string;
    reason: EmailConfirmationFailureReason;
    duration_ms: number;
    attempt_number?: number;
    source?: EmailConfirmationSource;
  };
  email_confirmation_resend_blocked: BaseProps & {
    reason: 'cooldown';
    cooldown_seconds_left?: number;
    source?: EmailConfirmationSource;
  };
  email_confirmation_succeeded: BaseProps & {
    attempt_id?: string;
    duration_ms?: number;
    already_confirmed?: boolean;
    source?: EmailConfirmationSource;
  };
  email_confirmation_failed: BaseProps & {
    attempt_id?: string;
    reason: EmailConfirmationFailureReason;
    duration_ms?: number;
    source?: EmailConfirmationSource;
  };
  email_confirmation_continue_clicked: BaseProps & {
    already_confirmed?: boolean;
    source?: EmailConfirmationSource;
  };

  onboarding_started: BaseProps & {
    user_role: 'tutor' | 'student' | 'unknown';
  };
  onboarding_step_viewed: BaseProps & {
    step: OnboardingStepName | string;
    step_index: number;
    total_steps: number;
    user_role: 'tutor' | 'student' | 'unknown';
  };
  onboarding_step_completed: BaseProps & {
    step: OnboardingStepName | string;
    step_index: number;
    total_steps: number;
    user_role: 'tutor' | 'student' | 'unknown';
  };
  onboarding_step_skipped: BaseProps & {
    step: OnboardingStepName | string;
    step_index: number;
    total_steps: number;
    user_role: 'tutor' | 'student' | 'unknown';
    skip_reason?: OnboardingSkipReason;
  };
  onboarding_step_failed: BaseProps & {
    step: OnboardingStepName | string;
    step_index: number;
    total_steps: number;
    user_role: 'tutor' | 'student' | 'unknown';
    reason: OnboardingStepFailReason;
  };
  onboarding_step_back: BaseProps & {
    from_step: OnboardingStepName | string;
    to_step: OnboardingStepName | string;
    step_index: number;
    total_steps: number;
    user_role: 'tutor' | 'student' | 'unknown';
  };
  onboarding_completed: BaseProps & {
    user_role: 'tutor' | 'student' | 'unknown';
    duration_ms?: number;
    completion_path?: 'tour_done' | 'skipped' | 'auto_no_steps' | 'unknown';
  };

  student_invite_viewed: BaseProps & {
    source: string;
  };
  student_invite_submit: BaseProps & {
    attempt_id: string;
    source: string;
  };
  student_invited_success: BaseProps & {
    attempt_id?: string;
    invite_id?: string;
    source: string;
    invite_kind?: ProductAnalyticsInviteKind;
    is_first_invite?: boolean;
    duration_ms?: number;
    role?: ProductAnalyticsRole;
  };
  student_invite_failed: BaseProps & {
    attempt_id: string;
    source: string;
    reason: InviteFailureReason;
    duration_ms: number;
  };
  student_invite_link_copied: BaseProps & {
    invite_id?: string;
    source: string;
  };
  student_invite_shared: BaseProps & {
    invite_id?: string;
    source: string;
  };

  student_invite_opened: {
    event_version?: number;
    invite_id: string;
    tutor_id?: string;
    student_authenticated: boolean;
  };
  student_invite_accept_submit: {
    event_version?: number;
    invite_id: string;
    tutor_id?: string;
    attempt_id: string;
    student_authenticated: boolean;
  };
  invite_accepted_success: {
    event_version?: number;
    invite_id?: string;
    tutor_id?: string;
    attempt_id?: string;
    student_authenticated?: boolean;
    role?: ProductAnalyticsRole;
    invite_kind?: ProductAnalyticsInviteKind;
  };
  student_invite_accept_failed: {
    event_version?: number;
    invite_id: string;
    tutor_id?: string;
    attempt_id: string;
    student_authenticated: boolean;
    reason: InviteFailureReason;
    duration_ms: number;
  };

  lesson_create_viewed: BaseProps & {
    source: string;
  };
  lesson_create_submit: BaseProps & {
    attempt_id: string;
    source: string;
    lesson_type?: ProductAnalyticsLessonType;
    is_recurring?: boolean;
  };
  lesson_created_success: BaseProps & {
    attempt_id?: string;
    lesson_id?: string;
    source: string;
    lesson_type: ProductAnalyticsLessonType;
    students_count?: number;
    is_recurring: boolean;
    is_first_lesson?: boolean;
    duration_ms?: number;
    has_description?: boolean;
    role?: ProductAnalyticsRole;
  };
  lesson_create_failed: BaseProps & {
    attempt_id: string;
    source: string;
    reason: LessonCreateFailureReason;
    duration_ms: number;
  };

  lesson_opened: {
    event_version?: number;
    lesson_id?: string;
    actor_role: ProductAnalyticsActorRole | ProductAnalyticsRole;
    source?: string;
    students_count?: number;
  };
  prejoin_viewed: {
    event_version?: number;
    lesson_id?: string;
    actor_role: ProductAnalyticsActorRole | ProductAnalyticsRole;
    source?: string;
  };
  lesson_started: {
    event_version?: number;
    lesson_id?: string;
    actor_role?: ProductAnalyticsActorRole | ProductAnalyticsRole;
    role?: ProductAnalyticsRole;
    source: ProductAnalyticsSource | string;
    lesson_type?: ProductAnalyticsLessonType;
    students_count?: number;
  };
  lesson_joined: {
    event_version?: number;
    lesson_id?: string;
    actor_role?: ProductAnalyticsActorRole | ProductAnalyticsRole;
    role?: ProductAnalyticsRole;
    source: ProductAnalyticsSource | string;
    lesson_type?: ProductAnalyticsLessonType;
    students_count?: number;
  };

  media_permission_requested: {
    event_version?: number;
    lesson_id?: string;
    attempt_id?: string;
    media_type: MediaType;
  };
  media_permission_granted: {
    event_version?: number;
    lesson_id?: string;
    attempt_id?: string;
    media_type: MediaType;
  };
  media_permission_denied: {
    event_version?: number;
    lesson_id?: string;
    attempt_id?: string;
    media_type: MediaType;
    reason: PermissionFailureReason;
  };
  media_device_unavailable: {
    event_version?: number;
    lesson_id?: string;
    attempt_id?: string;
    media_type: MediaType;
    reason: PermissionFailureReason;
  };
  media_permission_help_opened: {
    event_version?: number;
    lesson_id?: string;
    media_type?: MediaType;
  };

  call_connect_attempted: {
    event_version?: number;
    lesson_id?: string;
    attempt_id: string;
    actor_role: ProductAnalyticsActorRole | ProductAnalyticsRole;
    attempt_number: number;
  };
  call_connected: {
    event_version?: number;
    lesson_id?: string;
    attempt_id?: string;
    actor_role?: ProductAnalyticsActorRole | ProductAnalyticsRole;
    role?: ProductAnalyticsRole;
    attempt_number?: number;
    duration_ms?: number;
    recovered_after_failure?: boolean;
    lesson_type?: ProductAnalyticsLessonType;
  };
  call_connection_failed: {
    event_version?: number;
    lesson_id?: string;
    attempt_id?: string;
    actor_role?: ProductAnalyticsActorRole | ProductAnalyticsRole;
    role?: ProductAnalyticsRole;
    attempt_number?: number;
    reason: CallFailureReason | ProductAnalyticsCallFailureReasonCompat;
    duration_ms?: number;
    retry_available?: boolean;
  };

  lesson_duration_reached: {
    event_version?: number;
    lesson_id?: string;
    actor_role: ProductAnalyticsActorRole | ProductAnalyticsRole;
    role?: ProductAnalyticsRole;
    duration_threshold?: LessonDurationThreshold;
    duration_min?: number;
    students_count?: number;
    student_joined?: boolean;
    board_used?: boolean;
    screen_share_used?: boolean;
    used_board?: boolean;
    used_screenshare?: boolean;
    lesson_type?: ProductAnalyticsLessonType;
  };
  lesson_finished: {
    event_version?: number;
    lesson_id?: string;
    actor_role?: ProductAnalyticsActorRole | ProductAnalyticsRole;
    role?: ProductAnalyticsRole;
    total_duration_seconds?: number;
    finish_reason?: LessonFinishReason;
    students_joined_count?: number;
    duration_bucket?: ProductAnalyticsDurationBucket;
    lesson_type?: ProductAnalyticsLessonType;
    used_board?: boolean;
    used_screenshare?: boolean;
  };

  board_opened: {
    event_version?: number;
    lesson_id?: string;
    role?: ProductAnalyticsRole;
    source?: string;
  };
  board_used_meaningfully: {
    event_version?: number;
    lesson_id?: string;
    role?: ProductAnalyticsRole;
    trigger?: ProductAnalyticsBoardTrigger;
  };

  activation_help_opened: BaseProps & {
    screen: ActivationHelpScreen;
    reason: ActivationHelpReason | string;
  };
  activation_support_contacted: BaseProps & {
    screen: ActivationHelpScreen;
    reason: ActivationHelpReason | string;
    channel?: 'telegram' | 'vk' | 'email' | 'unknown';
  };
  activation_tutorial_started: BaseProps & {
    screen: ActivationHelpScreen;
    reason: ActivationHelpReason | string;
  };
  activation_tutorial_completed: BaseProps & {
    screen: ActivationHelpScreen;
    reason: ActivationHelpReason | string;
  };
};

/** Совместимость со старым enum причин ошибки звонка. */
type ProductAnalyticsCallFailureReasonCompat =
  'token_error' | 'connection_error' | 'permission_error' | 'unknown';

export type TrackableEventName = Extract<EventName, keyof ProductAnalyticsEventMap>;

export type TrackProductEventArgs<T extends TrackableEventName> = [
  eventName: T,
  properties: ProductAnalyticsEventMap[T],
];
