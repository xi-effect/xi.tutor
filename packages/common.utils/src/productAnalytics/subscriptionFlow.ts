import type {
  SubscriptionActivationType,
  SubscriptionAnalyticsSource,
  SubscriptionBillingPeriod,
} from './types';

const FLOW_KEY = 'subscription_purchase_flow';
const SOURCE_KEY = 'subscription_analytics_source';
const LOCAL_EXTENSION_KEY = 'subscription_local_period_extension';

const SOURCES: readonly SubscriptionAnalyticsSource[] = [
  'announcement',
  'settings',
  'pricing',
  'product_limit',
  'classrooms_limit',
  'board_objects_limit',
  'file_size_limit',
  'storage_limit',
  'other',
];

export type SubscriptionFlowState = {
  id: string;
  source: SubscriptionAnalyticsSource;
  currentPlan?: string;
  targetPlan: string;
  billingPeriod: SubscriptionBillingPeriod;
  activationType: SubscriptionActivationType;
  wasActive: boolean;
  autoRenewWasOn: boolean;
  shouldAutoRenew: boolean | null;
  paymentRedirected: boolean;
  redirectedAt: number | null;
  finished: boolean;
  activated: boolean;
};

export type SubscriptionFlowDraft = {
  source: SubscriptionAnalyticsSource;
  currentPlan?: string;
  targetPlan: string;
  billingPeriod: SubscriptionBillingPeriod;
  activationType: SubscriptionActivationType;
  wasActive: boolean;
  autoRenewWasOn: boolean;
  shouldAutoRenew?: boolean | null;
};

let memoryFlow: SubscriptionFlowState | null = null;
let memorySource: SubscriptionAnalyticsSource | null = null;
let memoryLocalExtension = false;

function createUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

export function isSubscriptionAnalyticsSource(
  value: string | null | undefined,
): value is SubscriptionAnalyticsSource {
  return SOURCES.includes(value as SubscriptionAnalyticsSource);
}

export function toSubscriptionBillingPeriod(
  period: string | null | undefined,
): SubscriptionBillingPeriod | null {
  if (period === 'year' || period === 'yearly') return 'year';
  if (period === 'month' || period === 'monthly') return 'month';
  return null;
}

export function billingPeriodFromSubscriptionDays(days: number): SubscriptionBillingPeriod {
  return days >= 300 ? 'year' : 'month';
}

export function resolveSubscriptionActivationType(input: {
  wasActive: boolean;
  hadSubscription: boolean;
  currentPlan?: string | null;
  targetPlan: string;
}): SubscriptionActivationType {
  if (input.wasActive || input.hadSubscription) return 'resume';
  if (
    input.currentPlan &&
    input.currentPlan !== 'basic' &&
    input.currentPlan !== input.targetPlan
  ) {
    return 'upgrade';
  }
  return 'new';
}

function readSession(key: string): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string): void {
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // sessionStorage может быть недоступен — остаётся память вкладки.
  }
}

function isFlow(value: unknown): value is SubscriptionFlowState {
  if (!value || typeof value !== 'object') return false;
  const flow = value as SubscriptionFlowState;
  return typeof flow.id === 'string' && flow.id.length > 0 && typeof flow.targetPlan === 'string';
}

function readFlow(): SubscriptionFlowState | null {
  const raw = readSession(FLOW_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (isFlow(parsed)) {
        memoryFlow = parsed;
        return parsed;
      }
    } catch {
      // повреждённая запись не должна рвать оплату
    }
  }
  return memoryFlow;
}

function writeFlow(flow: SubscriptionFlowState): SubscriptionFlowState {
  memoryFlow = flow;
  writeSession(FLOW_KEY, JSON.stringify(flow));
  return flow;
}

export function setSubscriptionAnalyticsSource(source: SubscriptionAnalyticsSource): void {
  memorySource = source;
  writeSession(SOURCE_KEY, source);
}

export function getSubscriptionAnalyticsSource(): SubscriptionAnalyticsSource {
  if (memorySource) return memorySource;
  const stored = readSession(SOURCE_KEY);
  if (isSubscriptionAnalyticsSource(stored)) {
    memorySource = stored;
    return stored;
  }
  return 'other';
}

export function readSubscriptionFlowRecord(): SubscriptionFlowState | null {
  return readFlow();
}

export function getSubscriptionFlow(): SubscriptionFlowState | null {
  const flow = readFlow();
  if (!flow || flow.finished) return null;
  return flow;
}

export function hasActiveSubscriptionFlow(): boolean {
  return getSubscriptionFlow() !== null;
}

export function beginSubscriptionFlow(draft: SubscriptionFlowDraft): SubscriptionFlowState {
  return writeFlow({
    id: createUuid(),
    source: draft.source,
    currentPlan: draft.currentPlan,
    targetPlan: draft.targetPlan,
    billingPeriod: draft.billingPeriod,
    activationType: draft.activationType,
    wasActive: draft.wasActive,
    autoRenewWasOn: draft.autoRenewWasOn,
    shouldAutoRenew: draft.shouldAutoRenew ?? null,
    paymentRedirected: false,
    redirectedAt: null,
    finished: false,
    activated: false,
  });
}

export function ensureSubscriptionFlow(draft: SubscriptionFlowDraft): SubscriptionFlowState {
  const current = getSubscriptionFlow();
  if (!current) return beginSubscriptionFlow(draft);

  return writeFlow({
    ...current,
    source: draft.source !== 'other' ? draft.source : current.source,
    currentPlan: draft.currentPlan ?? current.currentPlan,
    targetPlan: draft.targetPlan || current.targetPlan,
    billingPeriod: draft.billingPeriod,
    shouldAutoRenew: draft.shouldAutoRenew ?? current.shouldAutoRenew,
  });
}

export function rememberSubscriptionBillingPeriod(period: SubscriptionBillingPeriod): void {
  const current = getSubscriptionFlow();
  if (!current) return;
  writeFlow({ ...current, billingPeriod: period });
}

export function markSubscriptionPaymentRedirected(): SubscriptionFlowState | null {
  const current = getSubscriptionFlow();
  if (!current) return null;
  if (current.paymentRedirected) return current;
  return writeFlow({
    ...current,
    paymentRedirected: true,
    redirectedAt: Date.now(),
  });
}

export function finishSubscriptionFlow(): void {
  const current = readFlow();
  if (!current || current.finished) return;
  writeFlow({ ...current, finished: true });
}

/** Один раз на flow: платёж уже ушёл в ЮKassa и подписка стала активной. */
export function claimSubscriptionActivation(): SubscriptionFlowState | null {
  const current = readFlow();
  if (!current || current.finished || current.activated || !current.paymentRedirected) return null;
  return writeFlow({ ...current, activated: true, finished: true });
}

export function markSubscriptionPeriodExtendedLocally(): void {
  memoryLocalExtension = true;
  writeSession(LOCAL_EXTENSION_KEY, '1');
}

export function consumeLocalSubscriptionExtension(endsMoved: boolean): boolean {
  if (!endsMoved) return false;
  const marked = memoryLocalExtension || readSession(LOCAL_EXTENSION_KEY) === '1';
  if (!marked) return false;
  memoryLocalExtension = false;
  if (canUseStorage()) {
    try {
      window.sessionStorage.removeItem(LOCAL_EXTENSION_KEY);
    } catch {
      // ignore
    }
  }
  return true;
}

export function resetSubscriptionFlowForTests(): void {
  memoryFlow = null;
  memorySource = null;
  memoryLocalExtension = false;
}
