import { describe, expect, it } from 'vitest';
import type { ClassroomCounts, CurrentPlan, CurrentSubscription } from 'common.api';
import type { ClassroomStatusT, ClassroomT } from 'common.api';
import {
  activateLockedWithinLimit,
  fitActiveClassroomCount,
  hasMonetizationOverride,
  initialMonetizationOverride,
  lockActiveClassrooms,
  resolveMonetizationClassroomCounts,
  resolveMonetizationPlan,
  resolveMonetizationStorage,
  resolveMonetizationSubscription,
  type MonetizationOverride,
} from '../monetizationDevtools';

const now = Date.parse('2026-10-20T12:00:00Z');

const realPlan: CurrentPlan = {
  kind: 'pro',
  max_active_classrooms: 30,
  max_total_storage_bytes: 1000,
};

const realSubscription: CurrentSubscription = {
  subscription: { plan_kind: 'pro', ends_at: '2026-12-01T00:00:00Z' },
  auto_renewal: { renewal_period: 'yearly' },
};

const realCounts: ClassroomCounts = {
  active: 2,
  paused: 1,
  locked: 4,
  finished: 3,
};

const enabled = (patch: Partial<MonetizationOverride>): MonetizationOverride => ({
  ...initialMonetizationOverride(),
  enabled: true,
  ...patch,
});

describe('подмена монетизации', () => {
  it('выключенная подмена возвращает серверные данные', () => {
    const state = initialMonetizationOverride();

    expect(hasMonetizationOverride(state)).toBe(false);
    expect(resolveMonetizationPlan(realPlan, state)).toBe(realPlan);
    expect(resolveMonetizationSubscription(realSubscription, state, now)).toBe(realSubscription);
    expect(resolveMonetizationStorage({ total_storage_bytes: 10 }, state)).toEqual({
      total_storage_bytes: 10,
    });
    expect(resolveMonetizationClassroomCounts(realCounts, state)).toBe(realCounts);
  });

  it('меняет тариф и лимиты отдельно от подписки', () => {
    const state = enabled({
      plan: 'basic',
      maxActiveClassrooms: 5,
      maxStorageBytes: 500,
      subscription: 'ended',
      endsAt: '2026-10-01T00:00:00Z',
      autoRenewal: false,
    });

    expect(resolveMonetizationPlan(realPlan, state)).toEqual({
      kind: null,
      max_active_classrooms: 5,
      max_total_storage_bytes: 500,
    });
    expect(resolveMonetizationSubscription(null, state, now)).toEqual({
      subscription: { plan_kind: 'pro', ends_at: '2026-10-01T00:00:00Z' },
      auto_renewal: null,
    });
  });

  it('задаёт использование кабинетов и хранилища, включая превышение', () => {
    const state = enabled({
      activeClassrooms: 6,
      storageUsedBytes: 700,
    });

    expect(resolveMonetizationClassroomCounts(realCounts, state)).toEqual({
      active: 6,
      paused: 1,
      locked: 4,
      finished: 3,
    });
    expect(resolveMonetizationStorage({ total_storage_bytes: 10 }, state)).toEqual({
      total_storage_bytes: 700,
    });
  });

  it('отличает отсутствие подписки от активной с автопродлением', () => {
    expect(
      resolveMonetizationSubscription(realSubscription, enabled({ subscription: 'never' }), now),
    ).toBeNull();
    expect(
      resolveMonetizationSubscription(
        null,
        enabled({ subscription: 'active', endsAt: '2026-11-20T00:00:00Z', autoRenewal: true }),
        now,
      ),
    ).toEqual({
      subscription: { plan_kind: 'pro', ends_at: '2026-11-20T00:00:00Z' },
      auto_renewal: { renewal_period: 'monthly' },
    });
  });

  it('при переходе на Профи активирует недоступные кабинеты в пределах лимита', () => {
    const classrooms = [
      room(1, 'active', 1),
      ...Array.from({ length: 70 }, (_, index) => room(index + 2, 'locked', index + 2)),
    ];

    const next = activateLockedWithinLimit(classrooms, 60);
    const counts = resolveMonetizationClassroomCounts(
      realCounts,
      enabled({ classroomCatalog: next }),
    );

    expect(counts).toEqual({ active: 60, paused: 0, locked: 11, finished: 0 });
    expect(next.find((classroom) => classroom.id === 2)?.status).toBe('active');
    expect(next.find((classroom) => classroom.id === 71)?.status).toBe('locked');
  });

  it('при переходе на Базовый блокирует активные кабинеты и оставляет остальные статусы', () => {
    const next = lockActiveClassrooms([
      room(1, 'active', 1),
      room(2, 'paused', 2),
      room(3, 'locked', 3),
      room(4, 'finished', 4),
    ]);

    expect(next.map((classroom) => classroom.status)).toEqual([
      'locked',
      'paused',
      'locked',
      'finished',
    ]);
  });

  it('подгоняет число активных кабинетов под лимит создания', () => {
    const next = fitActiveClassroomCount(
      [room(1, 'active', 1), room(2, 'active', 2), room(3, 'locked', 3), room(4, 'active', 4)],
      2,
    );

    expect(next.map((classroom) => [classroom.id, classroom.status])).toEqual([
      [1, 'active'],
      [2, 'active'],
      [3, 'locked'],
      [4, 'locked'],
    ]);
  });
});

const room = (id: number, status: ClassroomStatusT, order: number): ClassroomT =>
  ({
    id,
    kind: 'group',
    status,
    created_at: new Date(Date.UTC(2026, 0, 1, 0, 0, order)).toISOString(),
    description: null,
    name: `Кабинет ${id}`,
    subject_id: null,
    tutor_id: 1,
  }) as ClassroomT;
