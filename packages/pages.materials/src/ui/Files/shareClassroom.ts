import type { ClassroomT, GroupClassroomT } from 'common.api';

const AVATAR_TONES = [
  'bg-tag-violet-background',
  'bg-status-info-background',
  'bg-tag-orange-background',
  'bg-tag-cyan-background',
] as const;

export type ClassroomAvatarTone = (typeof AVATAR_TONES)[number];

export const getClassroomInitials = (name: string): string => {
  const words = name
    .trim()
    .split(/[\s·•-]+/)
    .filter(Boolean);

  if (words.length === 0) {
    return '?';
  }

  const first = words[0];

  if (/^[0-9A-Za-zА-Яа-яЁё]{1,3}$/.test(first) && (words.length === 1 || first.length >= 2)) {
    return first.slice(0, 2).toUpperCase();
  }

  if (words.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export const getClassroomAvatarTone = (id: number): ClassroomAvatarTone =>
  AVATAR_TONES[Math.abs(id) % AVATAR_TONES.length];

export const getGroupEnrollmentsCount = (classroom: ClassroomT): number | undefined => {
  if (classroom.kind !== 'group') {
    return undefined;
  }

  const count = (classroom as GroupClassroomT & { enrollments_count?: number }).enrollments_count;
  return typeof count === 'number' ? count : undefined;
};

export const isClassroomArchived = (classroom: ClassroomT): boolean =>
  classroom.status === 'finished' || classroom.status === 'locked';

export const isConflictError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return false;
  }

  const response = (error as { response?: { status?: number } }).response;
  return response?.status === 409;
};
