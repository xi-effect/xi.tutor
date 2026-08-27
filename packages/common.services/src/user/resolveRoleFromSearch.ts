import type { RoleT } from 'common.types';

export function parseRoleFromSearch(role: unknown): RoleT | null {
  if (role === 'tutor' || role === 'student') return role;
  return null;
}

export type RoleFromSearchAction =
  | { type: 'noop' }
  | { type: 'clear' }
  | { type: 'switch'; role: RoleT };

export function resolveRoleFromSearch(input: {
  urlRole: unknown;
  currentLayout: string | null | undefined;
  hasUser: boolean;
}): RoleFromSearchAction {
  if (!input.hasUser) return { type: 'noop' };

  const role = parseRoleFromSearch(input.urlRole);
  if (!role) return { type: 'noop' };
  if (role === input.currentLayout) return { type: 'clear' };

  return { type: 'switch', role };
}
