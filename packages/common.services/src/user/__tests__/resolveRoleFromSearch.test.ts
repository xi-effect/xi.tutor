import { describe, expect, it } from 'vitest';
import { parseRoleFromSearch, resolveRoleFromSearch } from '../resolveRoleFromSearch';

describe('parseRoleFromSearch', () => {
  it('принимает tutor и student', () => {
    expect(parseRoleFromSearch('tutor')).toBe('tutor');
    expect(parseRoleFromSearch('student')).toBe('student');
  });

  it('отклоняет пустые и неизвестные значения', () => {
    expect(parseRoleFromSearch(undefined)).toBeNull();
    expect(parseRoleFromSearch(null)).toBeNull();
    expect(parseRoleFromSearch('')).toBeNull();
    expect(parseRoleFromSearch('admin')).toBeNull();
  });
});

describe('resolveRoleFromSearch', () => {
  it('ждёт загрузку пользователя', () => {
    expect(
      resolveRoleFromSearch({
        urlRole: 'student',
        currentLayout: 'tutor',
        hasUser: false,
      }),
    ).toEqual({ type: 'noop' });
  });

  it('ничего не делает без валидной роли в URL', () => {
    expect(
      resolveRoleFromSearch({
        urlRole: undefined,
        currentLayout: 'tutor',
        hasUser: true,
      }),
    ).toEqual({ type: 'noop' });
  });

  it('очищает URL, если роль уже совпадает', () => {
    expect(
      resolveRoleFromSearch({
        urlRole: 'tutor',
        currentLayout: 'tutor',
        hasUser: true,
      }),
    ).toEqual({ type: 'clear' });
  });

  it('переключает роль, если она отличается от текущей', () => {
    expect(
      resolveRoleFromSearch({
        urlRole: 'student',
        currentLayout: 'tutor',
        hasUser: true,
      }),
    ).toEqual({ type: 'switch', role: 'student' });
  });
});
