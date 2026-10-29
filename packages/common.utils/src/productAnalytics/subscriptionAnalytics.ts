import { PRODUCT_ANALYTICS_EVENTS } from './events';
import { trackOnce } from './once';
import {
  beginSubscriptionFlow,
  billingPeriodFromSubscriptionDays,
  claimSubscriptionActivation,
  consumeLocalSubscriptionExtension,
  ensureSubscriptionFlow,
  finishSubscriptionFlow,
  getSubscriptionAnalyticsSource,
  getSubscriptionFlow,
  markSubscriptionPaymentRedirected,
  readSubscriptionFlowRecord,
  rememberSubscriptionBillingPeriod,
  resolveSubscriptionActivationType,
  setSubscriptionAnalyticsSource,
  toSubscriptionBillingPeriod,
  type SubscriptionFlowDraft,
} from './subscriptionFlow';
import { trackProductEvent } from './umami';
import type {
  SubscriptionAnalyticsSource,
  SubscriptionBillingPeriod,
  SubscriptionCheckoutFailureReason,
  SubscriptionDowngradeReason,
  SubscriptionPaymentReturnResult,
  SubscriptionPaywallLimitType,
  SubscriptionPromoFailureReason,
  SubscriptionRenewalFailureReason,
} from './types';

const EVENT_VERSION = 1;
const ACTIVATION_WINDOW_MS = 6 * 60 * 60 * 1000;
const SNAPSHOT_PREFIX = 'subscription_lifecycle_snapshot:';

const USER_CANCELLED_REASONS = new Set([
  'canceled_by_user',
  'cancelled_by_user',
  'expired_on_confirmation',
]);

const PROMO_REASONS = new Set<SubscriptionPromoFailureReason>([
  'invalid',
  'expired',
  'not_applicable',
  'already_used',
  'unknown',
]);

export type SubscriptionPurchaseContext = {
  source?: SubscriptionAnalyticsSource;
  currentPlan?: string;
  targetPlan?: string;
  billingPeriod?: SubscriptionBillingPeriod;
  wasActive?: boolean;
  hadSubscription?: boolean;
  autoRenewWasOn?: boolean;
  shouldAutoRenew?: boolean;
};

export type SubscriptionLifecycleSnapshot = {
  plan: string;
  active: boolean;
  endsAt: string | null;
  billingPeriod: SubscriptionBillingPeriod | null;
  autoRenew: boolean;
};

type ErrorLike = {
  code?: string;
  message?: string;
  response?: { status?: number; data?: { detail?: unknown } };
};

const paywallSeenAt = new Map<string, number>();
const lifecycleMemory = new Map<string, SubscriptionLifecycleSnapshot>();

function readStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const status = (error as ErrorLike).response?.status;
  return typeof status === 'number' ? status : undefined;
}

function readDetail(error: unknown): string {
  const detail = (error as ErrorLike | null)?.response?.data?.detail;
  return typeof detail === 'string' ? detail.trim().toLowerCase() : '';
}

function isNetworkError(error: unknown): boolean {
  if (readStatus(error)) return false;
  if (!error || typeof error !== 'object') return true;
  const candidate = error as ErrorLike;
  return (
    candidate.code === 'ERR_NETWORK' ||
    candidate.code === 'ECONNABORTED' ||
    candidate.message === 'Network Error' ||
    !candidate.response
  );
}

function definedProps<T extends Record<string, unknown>>(props: T): T {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)) as T;
}

function draftFromContext(context: SubscriptionPurchaseContext): SubscriptionFlowDraft {
  const targetPlan = context.targetPlan ?? 'pro';
  const source = context.source ?? getSubscriptionAnalyticsSource();
  return {
    source,
    currentPlan: context.currentPlan,
    targetPlan,
    billingPeriod: context.billingPeriod ?? 'month',
    activationType: resolveSubscriptionActivationType({
      wasActive: Boolean(context.wasActive),
      hadSubscription: Boolean(context.hadSubscription),
      currentPlan: context.currentPlan,
      targetPlan,
    }),
    wasActive: Boolean(context.wasActive),
    autoRenewWasOn: Boolean(context.autoRenewWasOn),
    shouldAutoRenew: context.shouldAutoRenew,
  };
}

export function mapSubscriptionCheckoutFailure(error: unknown): SubscriptionCheckoutFailureReason {
  const status = readStatus(error);
  if (status === 409) return 'already_subscribed';
  if (status === 400 || status === 422) return 'invalid_plan';
  if (status && status >= 400) return 'payment_create_failed';
  if (isNetworkError(error)) return 'network_error';
  return 'unknown';
}

export function mapSubscriptionPaymentReturnResult(
  payment: { completed_at?: string | null; cancellation_reason?: string | null } | null,
): SubscriptionPaymentReturnResult {
  if (!payment) return 'unknown';
  const reason = payment.cancellation_reason?.trim() || null;
  if (payment.completed_at && !reason) return 'success';
  if (!payment.completed_at && !reason) return 'pending';
  if (reason && USER_CANCELLED_REASONS.has(reason)) return 'cancelled';
  if (reason) return 'failed';
  return 'unknown';
}

export function mapSubscriptionPromoFailure(error: unknown): SubscriptionPromoFailureReason {
  const detail = readDetail(error);
  if (PROMO_REASONS.has(detail as SubscriptionPromoFailureReason)) {
    return detail as SubscriptionPromoFailureReason;
  }

  const status = readStatus(error);
  if (status === 404 || status === 400) return 'invalid';
  if (status === 410) return 'expired';
  if (status === 409) return 'already_used';
  if (status === 422) return 'not_applicable';
  return 'unknown';
}

export function mapSubscriptionRenewalFailure(
  reason: string | null | undefined,
): SubscriptionRenewalFailureReason {
  switch (reason) {
    case 'insufficient_funds':
      return 'insufficient_funds';
    case 'payment_method_limit_exceeded':
    case 'payment_method_restricted':
    case 'card_expired':
    case 'permission_revoked':
    case '3d_secure_failed':
    case 'call_issuer':
      return 'payment_method_failed';
    case 'internal_error':
      return 'internal_error';
    case 'general_decline':
    case 'fraud_suspected':
    case 'country_forbidden':
    case 'internal_timeout':
      return 'provider_error';
    default:
      return 'unknown';
  }
}

export function subscriptionSourceForPaywall(
  limitType: SubscriptionPaywallLimitType,
): SubscriptionAnalyticsSource {
  switch (limitType) {
    case 'file_size':
      return 'file_size_limit';
    case 'board_objects':
      return 'board_objects_limit';
    case 'classrooms':
      return 'classrooms_limit';
    case 'storage':
      return 'storage_limit';
    default:
      return 'product_limit';
  }
}

export function trackSubscriptionPricingViewed(props: {
  source: SubscriptionAnalyticsSource;
  currentPlan?: string;
}): void {
  trackProductEvent(
    PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_PRICING_VIEWED,
    definedProps({
      source: props.source,
      current_plan: props.currentPlan,
      event_version: EVENT_VERSION,
    }),
  );
}

export function trackSubscriptionPlanSelected(context: SubscriptionPurchaseContext): string {
  const flow = beginSubscriptionFlow(draftFromContext(context));
  trackProductEvent(
    PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_PLAN_SELECTED,
    definedProps({
      subscription_flow_id: flow.id,
      source: flow.source,
      current_plan: flow.currentPlan,
      target_plan: flow.targetPlan,
      billing_period: flow.billingPeriod,
      event_version: EVENT_VERSION,
    }),
  );
  return flow.id;
}

export function trackSubscriptionBillingPeriodChanged(
  billingPeriod: SubscriptionBillingPeriod,
  previousBillingPeriod: SubscriptionBillingPeriod,
): void {
  if (billingPeriod === previousBillingPeriod) return;
  rememberSubscriptionBillingPeriod(billingPeriod);
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_BILLING_PERIOD_CHANGED, {
    billing_period: billingPeriod,
    previous_billing_period: previousBillingPeriod,
    event_version: EVENT_VERSION,
  });
}

export function trackSubscriptionCheckoutStarted(context: SubscriptionPurchaseContext): string {
  const flow = ensureSubscriptionFlow(draftFromContext(context));
  trackOnce(`subscription_checkout_started:${flow.id}`, () => {
    trackProductEvent(
      PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_CHECKOUT_STARTED,
      definedProps({
        subscription_flow_id: flow.id,
        source: flow.source,
        current_plan: flow.currentPlan,
        target_plan: flow.targetPlan,
        billing_period: flow.billingPeriod,
        event_version: EVENT_VERSION,
      }),
    );
  });
  return flow.id;
}

export function trackSubscriptionPaymentRedirected(): void {
  const existing = getSubscriptionFlow();
  if (!existing || existing.paymentRedirected) return;
  const flow = markSubscriptionPaymentRedirected();
  if (!flow) return;
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_PAYMENT_REDIRECTED, {
    subscription_flow_id: flow.id,
    target_plan: flow.targetPlan,
    billing_period: flow.billingPeriod,
    event_version: EVENT_VERSION,
  });
}

export function trackSubscriptionCheckoutFailed(
  reason: SubscriptionCheckoutFailureReason,
  context?: SubscriptionPurchaseContext,
): void {
  const draft = draftFromContext(context ?? {});
  const flow = ensureSubscriptionFlow(draft);
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_CHECKOUT_FAILED, {
    subscription_flow_id: flow.id,
    target_plan: flow.targetPlan,
    billing_period: flow.billingPeriod,
    reason,
    event_version: EVENT_VERSION,
  });
  finishSubscriptionFlow();
}

export function trackSubscriptionPaymentReturned(props: {
  result: SubscriptionPaymentReturnResult;
  targetPlan?: string;
  billingPeriod?: SubscriptionBillingPeriod;
  subscriptionDays?: number;
}): void {
  const flow = getSubscriptionFlow();
  const billingPeriod =
    props.billingPeriod ??
    flow?.billingPeriod ??
    (typeof props.subscriptionDays === 'number'
      ? billingPeriodFromSubscriptionDays(props.subscriptionDays)
      : undefined);

  trackProductEvent(
    PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_PAYMENT_RETURNED,
    definedProps({
      subscription_flow_id: flow?.id,
      target_plan: props.targetPlan ?? flow?.targetPlan,
      billing_period: billingPeriod,
      result: props.result,
      event_version: EVENT_VERSION,
    }),
  );

  if (props.result !== 'pending' && props.result !== 'success') {
    finishSubscriptionFlow();
  }
}

export function trackSubscriptionActivatedFromFlow(overrides?: {
  plan?: string;
  billingPeriod?: SubscriptionBillingPeriod;
}): boolean {
  const flow = claimSubscriptionActivation();
  if (!flow) return false;

  const plan = overrides?.plan ?? flow.targetPlan;
  const billingPeriod = overrides?.billingPeriod ?? flow.billingPeriod;

  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED, {
    subscription_flow_id: flow.id,
    plan,
    billing_period: billingPeriod,
    activation_type: flow.activationType,
    event_version: EVENT_VERSION,
  });

  if (flow.wasActive && !flow.autoRenewWasOn && flow.shouldAutoRenew) {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_AUTO_RENEW_ENABLED, {
      plan,
      billing_period: billingPeriod,
      event_version: EVENT_VERSION,
    });
  }

  return true;
}

const activatedPaymentIds = new Set<string>();

export function trackConfirmedSubscriptionActivation(input: {
  paymentId: string;
  plan: string;
  billingPeriod: SubscriptionBillingPeriod;
}): void {
  if (!input.paymentId || activatedPaymentIds.has(input.paymentId)) return;

  const record = readSubscriptionFlowRecord();
  if (record?.activated) {
    activatedPaymentIds.add(input.paymentId);
    return;
  }
  if (record && !record.paymentRedirected) return;

  activatedPaymentIds.add(input.paymentId);

  if (
    record?.paymentRedirected &&
    trackSubscriptionActivatedFromFlow({
      plan: input.plan,
      billingPeriod: input.billingPeriod,
    })
  ) {
    return;
  }

  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED, {
    plan: input.plan,
    billing_period: input.billingPeriod,
    activation_type: record?.activationType ?? 'new',
    event_version: EVENT_VERSION,
    ...(record && !record.finished ? { subscription_flow_id: record.id } : {}),
  });
}

export function trackSubscriptionManagementOpened(props: {
  plan: string;
  billingPeriod?: SubscriptionBillingPeriod | null;
}): void {
  trackProductEvent(
    PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_MANAGEMENT_OPENED,
    definedProps({
      plan: props.plan,
      billing_period: props.billingPeriod ?? undefined,
      event_version: EVENT_VERSION,
    }),
  );
}

export function trackSubscriptionAutoRenewDisabled(props: {
  plan: string;
  billingPeriod: SubscriptionBillingPeriod;
}): void {
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_AUTO_RENEW_DISABLED, {
    plan: props.plan,
    billing_period: props.billingPeriod,
    event_version: EVENT_VERSION,
  });
}

export function trackSubscriptionPaywallShown(
  props: {
    limitType: SubscriptionPaywallLimitType;
    currentPlan?: string;
  },
  dedupeMs = 0,
): boolean {
  const key = `${props.limitType}|${props.currentPlan ?? ''}`;
  if (dedupeMs > 0) {
    const seenAt = paywallSeenAt.get(key);
    if (seenAt !== undefined && Date.now() - seenAt < dedupeMs) return false;
    paywallSeenAt.set(key, Date.now());
  }

  trackProductEvent(
    PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_PAYWALL_SHOWN,
    definedProps({
      source: 'product_limit' as const,
      limit_type: props.limitType,
      current_plan: props.currentPlan,
      event_version: EVENT_VERSION,
    }),
  );
  return true;
}

export function trackSubscriptionPaywallUpgradeClicked(props: {
  limitType: SubscriptionPaywallLimitType;
  currentPlan?: string;
}): void {
  setSubscriptionAnalyticsSource(subscriptionSourceForPaywall(props.limitType));
  trackProductEvent(
    PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_PAYWALL_UPGRADE_CLICKED,
    definedProps({
      source: 'product_limit' as const,
      limit_type: props.limitType,
      current_plan: props.currentPlan,
      event_version: EVENT_VERSION,
    }),
  );
}

export function trackSubscriptionPromoCodeSubmitted(): void {
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_PROMO_CODE_SUBMITTED, {
    event_version: EVENT_VERSION,
  });
}

export function trackSubscriptionPromoCodeApplied(): void {
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_PROMO_CODE_APPLIED, {
    event_version: EVENT_VERSION,
  });
}

export function trackSubscriptionPromoCodeFailed(reason: SubscriptionPromoFailureReason): void {
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_PROMO_CODE_FAILED, {
    reason,
    event_version: EVENT_VERSION,
  });
}

function snapshotKey(userKey: string): string {
  return `${SNAPSHOT_PREFIX}${userKey}`;
}

function readSnapshot(userKey: string): SubscriptionLifecycleSnapshot | null {
  const memory = lifecycleMemory.get(userKey);
  if (memory) return memory;
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(snapshotKey(userKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SubscriptionLifecycleSnapshot;
    if (!parsed || typeof parsed.plan !== 'string' || typeof parsed.active !== 'boolean') {
      return null;
    }
    lifecycleMemory.set(userKey, parsed);
    return parsed;
  } catch {
    return null;
  }
}

function writeSnapshot(userKey: string, snapshot: SubscriptionLifecycleSnapshot): void {
  lifecycleMemory.set(userKey, snapshot);
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(snapshotKey(userKey), JSON.stringify(snapshot));
  } catch {
    // ignore
  }
}

function daysBetween(fromIso: string, toIso: string): number | null {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return (to - from) / 86_400_000;
}

function isRenewalExtension(
  previousEndsAt: string,
  nextEndsAt: string,
  period: SubscriptionBillingPeriod | null,
): boolean {
  const days = daysBetween(previousEndsAt, nextEndsAt);
  if (days === null || days <= 0) return false;
  if (period === 'year') return days >= 350 && days <= 370;
  if (period === 'month') return days >= 27 && days <= 33;
  return (days >= 27 && days <= 33) || (days >= 350 && days <= 370);
}

function trackRenewalSucceeded(snapshot: SubscriptionLifecycleSnapshot): void {
  if (!snapshot.billingPeriod) return;
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_RENEWAL_SUCCEEDED, {
    plan: snapshot.plan,
    billing_period: snapshot.billingPeriod,
    event_version: EVENT_VERSION,
  });
}

function trackRenewalFailed(snapshot: SubscriptionLifecycleSnapshot): void {
  if (!snapshot.billingPeriod) return;
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_RENEWAL_FAILED, {
    plan: snapshot.plan,
    billing_period: snapshot.billingPeriod,
    reason: 'unknown',
    event_version: EVENT_VERSION,
  });
}

function trackExpired(snapshot: SubscriptionLifecycleSnapshot): void {
  trackProductEvent(
    PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_EXPIRED,
    definedProps({
      plan: snapshot.plan,
      billing_period: snapshot.billingPeriod ?? undefined,
      event_version: EVENT_VERSION,
    }),
  );
}

function trackDowngraded(
  previousPlan: string,
  nextPlan: string,
  reason: SubscriptionDowngradeReason,
): void {
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_DOWNGRADED, {
    previous_plan: previousPlan,
    new_plan: nextPlan,
    reason,
    event_version: EVENT_VERSION,
  });
}

/**
 * Сравнивает последний снимок подписки с ответом backend.
 * На странице возврата из оплаты активацию не шлёт: её фиксирует сама страница
 * после `subscription_payment_returned`.
 */
export function observeSubscriptionLifecycle(
  userKey: string,
  next: SubscriptionLifecycleSnapshot,
  options?: { deferActivation?: boolean },
): void {
  if (!userKey) return;

  const previous = readSnapshot(userKey);
  if (!previous) {
    writeSnapshot(userKey, next);
    return;
  }

  const endsMoved = Boolean(previous.endsAt && next.endsAt && next.endsAt > previous.endsAt);
  const becameActive = !previous.active && next.active;
  const flow = getSubscriptionFlow();
  const redirectRecent = Boolean(
    flow?.paymentRedirected &&
    flow.redirectedAt &&
    Date.now() - flow.redirectedAt < ACTIVATION_WINDOW_MS,
  );
  const purchaseLanded = next.active && (!previous.active || endsMoved);

  if (options?.deferActivation && redirectRecent && purchaseLanded) return;

  if (consumeLocalSubscriptionExtension(endsMoved || becameActive)) {
    writeSnapshot(userKey, next);
    return;
  }

  if (redirectRecent && purchaseLanded) {
    trackSubscriptionActivatedFromFlow({
      plan: next.plan,
      billingPeriod: flow?.billingPeriod,
    });
    writeSnapshot(userKey, next);
    return;
  }

  if (
    previous.active &&
    next.active &&
    previous.autoRenew &&
    previous.endsAt &&
    next.endsAt &&
    isRenewalExtension(previous.endsAt, next.endsAt, previous.billingPeriod)
  ) {
    trackRenewalSucceeded({ ...next, billingPeriod: previous.billingPeriod ?? next.billingPeriod });
    writeSnapshot(userKey, next);
    return;
  }

  if (previous.active && !next.active && next.plan === 'pro') {
    return;
  }

  if (previous.active && !next.active) {
    if (previous.autoRenew) {
      trackRenewalFailed(previous);
      trackExpired(previous);
      trackDowngraded(previous.plan, next.plan, 'payment_failed');
    } else {
      trackExpired(previous);
      trackDowngraded(previous.plan, next.plan, 'cancelled');
    }
  }

  writeSnapshot(userKey, next);
}

export function resetSubscriptionAnalyticsForTests(): void {
  paywallSeenAt.clear();
  lifecycleMemory.clear();
  activatedPaymentIds.clear();
}

export { billingPeriodFromSubscriptionDays, toSubscriptionBillingPeriod };
