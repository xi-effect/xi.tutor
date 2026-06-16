export { PRODUCT_ANALYTICS_EVENTS, type ProductAnalyticsEventName } from './events';
export { trackProductEvent } from './umami';
export { getProductAnalyticsRole } from './roles';
export {
  DURATION_THRESHOLDS_MIN,
  getDurationBucket,
  getReachedDurationThresholds,
  type LessonDurationThresholdMin,
} from './lesson';
export { inferProductAnalyticsSourceFromPathname } from './inferSource';
export type {
  ProductAnalyticsRole,
  ProductAnalyticsSource,
  ProductAnalyticsLessonType,
  ProductAnalyticsInviteKind,
  ProductAnalyticsCallFailureReason,
  ProductAnalyticsDurationBucket,
  ProductAnalyticsBoardTrigger,
  UmamiEventPayload,
} from './types';
