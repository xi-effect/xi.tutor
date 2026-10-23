import { env } from 'common.env';
import { HttpMethod } from '../config';
import type { ClassroomStatusT } from '../types';

export const CLASSROOM_STATUSES = ['active', 'paused', 'locked', 'finished'] as const;
export const CLASSROOM_FILTER_MAX_STATUSES = CLASSROOM_STATUSES.length;
export const CLASSROOMS_SEARCH_DEFAULT_LIMIT = 25;
export const CLASSROOMS_SEARCH_MAX_LIMIT = 99;

export interface ClassroomCursor {
  created_at: string;
}

export interface ClassroomFilters {
  statuses?: readonly ClassroomStatusT[] | null;
}

export interface ClassroomSearchRequest {
  cursor: ClassroomCursor | null;
  limit: number;
  filters: ClassroomFilters;
}

const isClassroomStatus = (value: string): value is ClassroomStatusT =>
  (CLASSROOM_STATUSES as readonly string[]).includes(value);

export function normalizeClassroomsSearchLimit(limit?: number): number {
  const value = limit ?? CLASSROOMS_SEARCH_DEFAULT_LIMIT;
  if (!Number.isFinite(value)) {
    return CLASSROOMS_SEARCH_DEFAULT_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(value), 1), CLASSROOMS_SEARCH_MAX_LIMIT);
}

export function normalizeClassroomStatuses(
  statuses?: readonly ClassroomStatusT[] | null,
): ClassroomStatusT[] | undefined {
  if (!statuses?.length) {
    return undefined;
  }

  const selected = new Set(statuses.filter((status) => isClassroomStatus(status)));
  const next = CLASSROOM_STATUSES.filter((status) => selected.has(status));
  return next.length > 0 ? [...next] : undefined;
}

export function normalizeClassroomFilters(filters?: ClassroomFilters | null): ClassroomFilters {
  const statuses = normalizeClassroomStatuses(filters?.statuses);
  return statuses ? { statuses } : {};
}

export function serializeClassroomStatuses(statuses?: readonly ClassroomStatusT[] | null): string {
  return normalizeClassroomStatuses(statuses)?.join(',') ?? '';
}

export function classroomStatusesFromQueryKey(
  queryKey: readonly unknown[],
): ClassroomStatusT[] | null | undefined {
  const kind = queryKey[1];
  if (kind !== 'search' && kind !== 'list') {
    return undefined;
  }

  const raw = queryKey[3];
  if (typeof raw !== 'string' || raw.length === 0) {
    return null;
  }

  return normalizeClassroomStatuses(raw.split(',') as ClassroomStatusT[]) ?? null;
}

export function buildClassroomSearchRequest(
  cursor: ClassroomCursor | null,
  limit?: number,
  filters?: ClassroomFilters | null,
): ClassroomSearchRequest {
  return {
    cursor,
    limit: normalizeClassroomsSearchLimit(limit),
    filters: normalizeClassroomFilters(filters),
  };
}

export function getNextClassroomsCursor(
  lastPage: Array<{ created_at?: string }>,
  limit: number,
): ClassroomCursor | undefined {
  if (!lastPage.length || lastPage.length < limit) {
    return undefined;
  }

  const createdAt = lastPage[lastPage.length - 1]?.created_at;
  if (!createdAt) {
    return undefined;
  }

  return { created_at: createdAt };
}

enum ClassroomsQueryKey {
  GetClassrooms = 'GetClassrooms',
  SearchClassrooms = 'SearchClassrooms',
  CreateGroupClassroom = 'CreateGroupClassroom',
  GetClassroom = 'GetClassroom',
  DeleteClassroom = 'DeleteClassroom',
  UpdateIndividualClassroom = 'UpdateIndividualClassroom',
  UpdateGroupClassroom = 'UpdateGroupClassroom',
  UpdateClassroomStatus = 'UpdateClassroomStatus',
  ClassroomCounts = 'classroomCounts',
}

const classroomsApiConfig = {
  [ClassroomsQueryKey.GetClassrooms]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classrooms/`,
    method: HttpMethod.GET,
  },

  [ClassroomsQueryKey.SearchClassrooms]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classrooms/searches/`,
    method: HttpMethod.POST,
  },

  [ClassroomsQueryKey.CreateGroupClassroom]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/group-classrooms/`,
    method: HttpMethod.POST,
  },

  [ClassroomsQueryKey.GetClassroom]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classrooms/${classroomId}/`,
    method: HttpMethod.GET,
  },

  [ClassroomsQueryKey.DeleteClassroom]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classrooms/${classroomId}/`,
    method: HttpMethod.DELETE,
  },

  [ClassroomsQueryKey.UpdateIndividualClassroom]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/individual-classrooms/${classroomId}/`,
    method: HttpMethod.PATCH,
  },

  [ClassroomsQueryKey.UpdateGroupClassroom]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/group-classrooms/${classroomId}/`,
    method: HttpMethod.PATCH,
  },

  [ClassroomsQueryKey.UpdateClassroomStatus]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classrooms/${classroomId}/status/`,
    method: HttpMethod.PUT,
  },

  [ClassroomsQueryKey.ClassroomCounts]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classroom-status-counts/`,
    method: HttpMethod.GET,
  },
};

const classroomsQueryKeys = {
  classroomCounts: (userId: number) => [ClassroomsQueryKey.ClassroomCounts, userId] as const,
  search: (limit: number, statuses?: readonly ClassroomStatusT[] | null) =>
    [
      ClassroomsQueryKey.GetClassrooms,
      'search',
      normalizeClassroomsSearchLimit(limit),
      serializeClassroomStatuses(statuses),
    ] as const,
  list: (limit: number, statuses?: readonly ClassroomStatusT[] | null) =>
    [
      ClassroomsQueryKey.GetClassrooms,
      'list',
      normalizeClassroomsSearchLimit(limit),
      serializeClassroomStatuses(statuses),
    ] as const,
};

export type ClassroomCounts = {
  active: number;
  paused: number;
  locked: number;
  finished: number;
};

const isClassroomCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

export const parseClassroomCounts = (data: unknown): ClassroomCounts => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid ClassroomCounts');
  }

  const counts = data as Record<string, unknown>;
  if (
    !isClassroomCount(counts.active) ||
    !isClassroomCount(counts.paused) ||
    !isClassroomCount(counts.locked) ||
    !isClassroomCount(counts.finished)
  ) {
    throw new Error('Invalid ClassroomCounts');
  }

  return {
    active: counts.active,
    paused: counts.paused,
    locked: counts.locked,
    finished: counts.finished,
  };
};

export { classroomsApiConfig, ClassroomsQueryKey, classroomsQueryKeys };
