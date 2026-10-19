import type { UseQueryResult } from '@tanstack/react-query';
import type {
  ClassroomCounts,
  ClassroomStatusT,
  ClassroomT,
  CurrentPlan,
  CurrentSubscription,
  StorageUsage,
} from 'common.api';
import { useSyncExternalStore } from 'react';

export type MonetizationPlanMode = 'real' | 'basic' | 'pro';

export type MonetizationSubscriptionMode = 'real' | 'never' | 'active' | 'ending' | 'ended';

export type MonetizationPaymentPreview = 'pending' | 'success' | 'cancelled' | 'error';

export type MonetizationOverride = {
  enabled: boolean;
  plan: MonetizationPlanMode;
  maxActiveClassrooms: number | null;
  maxStorageBytes: number | null;
  activeClassrooms: number | null;
  storageUsedBytes: number | null;
  subscription: MonetizationSubscriptionMode;
  endsAt: string | null;
  autoRenewal: boolean;
  paymentPreview: MonetizationPaymentPreview | null;
  cancelDialogRequested: boolean;
  classroomCatalog: ClassroomT[] | null;
  keepActiveRequested: boolean;
};

type MonetizationDevState = {
  override: MonetizationOverride;
  patchOverride: (patch: Partial<MonetizationOverride>) => void;
  replaceOverride: (override: MonetizationOverride) => void;
  resetOverride: () => void;
  consumeCancelDialog: () => void;
  consumeKeepActive: () => void;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const initialMonetizationOverride = (): MonetizationOverride => ({
  enabled: false,
  plan: 'real',
  maxActiveClassrooms: null,
  maxStorageBytes: null,
  activeClassrooms: null,
  storageUsedBytes: null,
  subscription: 'real',
  endsAt: null,
  autoRenewal: true,
  paymentPreview: null,
  cancelDialogRequested: false,
  classroomCatalog: null,
  keepActiveRequested: false,
});

export const monetizationEndsAt = (daysFromNow: number, now = Date.now()): string =>
  new Date(now + daysFromNow * DAY_MS).toISOString();

export const hasMonetizationOverride = (state: MonetizationOverride): boolean =>
  state.enabled &&
  (state.plan !== 'real' ||
    state.maxActiveClassrooms !== null ||
    state.maxStorageBytes !== null ||
    state.activeClassrooms !== null ||
    state.storageUsedBytes !== null ||
    state.subscription !== 'real' ||
    state.paymentPreview !== null ||
    state.classroomCatalog !== null);

let override = initialMonetizationOverride();
const listeners = new Set<() => void>();

const emitMonetizationOverride = () => {
  listeners.forEach((listener) => listener());
};

const subscribeMonetizationOverride = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const patchOverride = (patch: Partial<MonetizationOverride>) => {
  override = { ...override, enabled: true, ...patch };
  emitMonetizationOverride();
};

const replaceOverride = (next: MonetizationOverride) => {
  override = next;
  emitMonetizationOverride();
};

const resetOverride = () => {
  override = initialMonetizationOverride();
  emitMonetizationOverride();
};

const consumeCancelDialog = () => {
  override = { ...override, cancelDialogRequested: false };
  emitMonetizationOverride();
};

const consumeKeepActive = () => {
  if (!override.keepActiveRequested) return;
  override = { ...override, keepActiveRequested: false };
  emitMonetizationOverride();
};

const replaceClassroomCatalog = (classroomCatalog: ClassroomT[]) => {
  override = { ...override, classroomCatalog };
  emitMonetizationOverride();
};

const monetizationDevState: MonetizationDevState = {
  get override() {
    return override;
  },
  patchOverride,
  replaceOverride,
  resetOverride,
  consumeCancelDialog,
  consumeKeepActive,
};

export const getMonetizationOverride = (): MonetizationOverride => override;

export const useMonetizationDevStore = <T>(selector: (state: MonetizationDevState) => T): T => {
  const current = useSyncExternalStore(
    subscribeMonetizationOverride,
    getMonetizationOverride,
    getMonetizationOverride,
  );

  return selector({ ...monetizationDevState, override: current });
};

export const resolveMonetizationPlan = (
  real: CurrentPlan | undefined,
  state: MonetizationOverride,
): CurrentPlan | undefined => {
  if (!hasMonetizationOverride(state)) return real;
  if (
    state.plan === 'real' &&
    state.maxActiveClassrooms === null &&
    state.maxStorageBytes === null
  ) {
    return real;
  }

  if (state.plan === 'real') {
    if (!real) return real;
    return {
      kind: real.kind,
      max_active_classrooms: state.maxActiveClassrooms ?? real.max_active_classrooms,
      max_total_storage_bytes: state.maxStorageBytes ?? real.max_total_storage_bytes,
    };
  }

  return {
    kind: state.plan === 'pro' ? 'pro' : null,
    max_active_classrooms: state.maxActiveClassrooms ?? real?.max_active_classrooms ?? 0,
    max_total_storage_bytes: state.maxStorageBytes ?? real?.max_total_storage_bytes ?? 0,
  };
};

export const resolveMonetizationSubscription = (
  real: CurrentSubscription | null | undefined,
  state: MonetizationOverride,
  now = Date.now(),
): CurrentSubscription | null | undefined => {
  if (!hasMonetizationOverride(state) || state.subscription === 'real') return real;
  if (state.subscription === 'never') return null;

  const fallbackDays =
    state.subscription === 'ended' ? -7 : state.subscription === 'ending' ? 3 : 30;

  return {
    subscription: {
      plan_kind: 'pro',
      ends_at: state.endsAt ?? monetizationEndsAt(fallbackDays, now),
    },
    auto_renewal: state.autoRenewal ? { renewal_period: 'monthly' } : null,
  };
};

export const resolveMonetizationStorage = (
  real: StorageUsage | undefined,
  state: MonetizationOverride,
): StorageUsage | undefined => {
  if (!hasMonetizationOverride(state) || state.storageUsedBytes === null) return real;
  return { total_storage_bytes: state.storageUsedBytes };
};

const byClassroomAge = (left: ClassroomT, right: ClassroomT) =>
  left.created_at.localeCompare(right.created_at) || left.id - right.id;

const withClassroomStatus = (classroom: ClassroomT, status: ClassroomStatusT): ClassroomT =>
  ({ ...classroom, status }) as ClassroomT;

export const tallyClassroomStatuses = (
  classrooms: ReadonlyArray<{ status: ClassroomStatusT }>,
): ClassroomCounts => {
  const counts: ClassroomCounts = { active: 0, paused: 0, locked: 0, finished: 0 };

  classrooms.forEach((classroom) => {
    counts[classroom.status] += 1;
  });

  return counts;
};

/** Недоступные кабинеты становятся активными, пока активных не станет `limit`. */
export const activateLockedWithinLimit = (
  classrooms: ClassroomT[],
  limit: number,
): ClassroomT[] => {
  const activeCount = classrooms.filter((classroom) => classroom.status === 'active').length;
  const slots = Math.max(0, limit - activeCount);
  if (slots === 0) return classrooms;

  const promote = new Set(
    classrooms
      .filter((classroom) => classroom.status === 'locked')
      .sort(byClassroomAge)
      .slice(0, slots)
      .map((classroom) => classroom.id),
  );

  return classrooms.map((classroom) =>
    promote.has(classroom.id) ? withClassroomStatus(classroom, 'active') : classroom,
  );
};

/** Активные кабинеты становятся недоступными. Остальные статусы не меняются. */
export const lockActiveClassrooms = (classrooms: ClassroomT[]): ClassroomT[] =>
  classrooms.map((classroom) =>
    classroom.status === 'active' ? withClassroomStatus(classroom, 'locked') : classroom,
  );

/** Подгоняет число активных кабинетов: лишние активные блокирует, недостающие поднимает из недоступных. */
export const fitActiveClassroomCount = (
  classrooms: ClassroomT[],
  desired: number,
): ClassroomT[] => {
  const active = classrooms
    .filter((classroom) => classroom.status === 'active')
    .sort(byClassroomAge);

  if (active.length > desired) {
    const lockIds = new Set(active.slice(desired).map((classroom) => classroom.id));
    return classrooms.map((classroom) =>
      lockIds.has(classroom.id) ? withClassroomStatus(classroom, 'locked') : classroom,
    );
  }

  if (active.length < desired) return activateLockedWithinLimit(classrooms, desired);
  return classrooms;
};

export const projectMonetizationClassrooms = (
  classrooms: ClassroomT[],
  statuses?: readonly ClassroomStatusT[] | null,
): ClassroomT[] => {
  if (!statuses?.length) return classrooms;
  return classrooms.filter((classroom) => statuses.includes(classroom.status));
};

export const mergeMonetizationClassrooms = (
  fetched: ClassroomT[],
  catalog: ClassroomT[] | null,
  statuses?: readonly ClassroomStatusT[] | null,
): ClassroomT[] => {
  if (!catalog) return projectMonetizationClassrooms(fetched, statuses);

  const byId = new Map<number, ClassroomT>();
  catalog.forEach((classroom) => byId.set(classroom.id, classroom));
  fetched.forEach((classroom) => {
    const simulated = byId.get(classroom.id);
    byId.set(
      classroom.id,
      simulated ? withClassroomStatus(classroom, simulated.status) : classroom,
    );
  });

  return projectMonetizationClassrooms([...byId.values()], statuses);
};

export const overlayClassroomStatus = <T extends { id: number; status: string }>(
  classroom: T | undefined,
  catalog: ClassroomT[] | null,
): T | undefined => {
  if (!classroom || !catalog) return classroom;

  const simulated = catalog.find((item) => item.id === classroom.id);
  if (!simulated || simulated.status === classroom.status) return classroom;

  return { ...classroom, status: simulated.status };
};

export const updateMonetizationClassroomStatus = (
  classroomId: number,
  status: ClassroomStatusT,
): ClassroomT | null => {
  const catalog = override.classroomCatalog;
  const current = catalog?.find((classroom) => classroom.id === classroomId);
  if (!catalog || !current) return null;

  const next = withClassroomStatus(current, status);
  replaceClassroomCatalog(
    catalog.map((classroom) => (classroom.id === classroomId ? next : classroom)),
  );
  return next;
};

export const activateMonetizationClassrooms = (classroomIds: readonly number[]): boolean => {
  const catalog = override.classroomCatalog;
  if (!catalog) return false;

  const selected = new Set(classroomIds);
  replaceClassroomCatalog(
    catalog.map((classroom) =>
      selected.has(classroom.id) ? withClassroomStatus(classroom, 'active') : classroom,
    ),
  );
  return true;
};

export const resolveMonetizationClassroomCounts = (
  real: ClassroomCounts | undefined,
  state: MonetizationOverride,
): ClassroomCounts | undefined => {
  if (state.classroomCatalog) return tallyClassroomStatuses(state.classroomCatalog);
  if (!hasMonetizationOverride(state) || state.activeClassrooms === null) return real;

  return {
    active: state.activeClassrooms,
    paused: real?.paused ?? 0,
    locked: real?.locked ?? 0,
    finished: real?.finished ?? 0,
  };
};

export const overlayMonetizationQuery = <T>(
  query: UseQueryResult<T>,
  data: T,
  active: boolean,
): UseQueryResult<T> => {
  if (!active) return query;

  return {
    ...query,
    data,
    error: null,
    isError: false,
    isPending: false,
    isLoading: false,
    isSuccess: true,
    isFetched: true,
    isFetching: false,
    isRefetching: false,
    isLoadingError: false,
    isRefetchError: false,
    isPlaceholderData: false,
    status: 'success',
    fetchStatus: 'idle',
  };
};
