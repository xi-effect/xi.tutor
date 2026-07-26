export {
  PRODUCT_ANALYTICS_EVENTS,
  DEPRECATED_ANALYTICS_EVENTS,
  type ProductAnalyticsEventName,
} from './events';
export { trackProductEvent } from './umami';
export { getProductAnalyticsRole } from './roles';
export {
  DURATION_THRESHOLDS_MIN,
  getDurationBucket,
  getReachedDurationThresholds,
  type LessonDurationThresholdMin,
} from './lesson';
export { inferProductAnalyticsSourceFromPathname } from './inferSource';
export { inferSignupEntryPoint } from './inferSignupEntryPoint';
export { inferEmailConfirmationSource } from './inferEmailConfirmationSource';
export {
  getOrCreateActivationFlowId,
  getActivationFlowId,
  resetActivationFlowId,
} from './activationFlowId';
export { createAttemptId, measureDurationMs, nowMs } from './attemptId';
export { nextSignupAttemptNumber, nextEmailResendAttemptNumber } from './attemptCounters';
export { trackOnce, resetTrackOnceKeys } from './once';
export { inferActivationHelpScreen } from './inferActivationHelpScreen';
export {
  mapSignupError,
  mapSignupValidationErrors,
  mapEmailConfirmationError,
  mapInviteError,
  mapLessonCreateError,
  mapCallError,
  mapPermissionError,
  getHttpStatusGroup,
} from './errorMappers';
export { mapOnboardingError } from './mapOnboardingError';
export {
  ONBOARDING_STEPS,
  mapOnboardingStageToStep,
  getOnboardingStepMeta,
} from './onboardingSteps';
export {
  resolveOnboardingAnalyticsRole,
  markOnboardingStartedAt,
  getOnboardingDurationMs,
  trackOnboardingStepCompleted,
  trackOnboardingStepSkipped,
  trackOnboardingStepFailed,
  trackOnboardingStepBack,
  trackOnboardingCompleted,
  type OnboardingAnalyticsRole,
} from './onboardingTracking';
export type { ProductAnalyticsEventMap, TrackableEventName } from './eventMap';
export type {
  ProductAnalyticsRole,
  ProductAnalyticsActorRole,
  ProductAnalyticsSource,
  ProductAnalyticsLessonType,
  ProductAnalyticsInviteKind,
  ProductAnalyticsCallFailureReason,
  ProductAnalyticsDurationBucket,
  ProductAnalyticsBoardTrigger,
  SignupEntryPoint,
  SignupFailureReason,
  SignupValidationFailureReason,
  EmailConfirmationFailureReason,
  EmailConfirmationSource,
  ActivationHelpReason,
  InviteFailureReason,
  LessonCreateFailureReason,
  CallFailureReason,
  PermissionFailureReason,
  HttpStatusGroup,
  OnboardingStepName,
  OnboardingStepFailReason,
  OnboardingSkipReason,
  MediaType,
  LessonDurationThreshold,
  LessonFinishReason,
  ActivationHelpScreen,
  CommonActivationProperties,
  UmamiEventPayload,
} from './types';
