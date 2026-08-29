import { describe, expect, it } from 'vitest';
import { resolveClassroomNameForProfile } from '../resolveClassroomNameForProfile';

describe('resolveClassroomNameForProfile', () => {
  it('возвращает обрезанное имя', () => {
    expect(resolveClassroomNameForProfile('  Иванов  ')).toBe('Иванов');
  });

  it('не отдаёт пустую строку: UserProfile падает на text[0]', () => {
    expect(resolveClassroomNameForProfile(' ')).toBe('?');
    expect(resolveClassroomNameForProfile('')).toBe('?');
    expect(resolveClassroomNameForProfile(null)).toBe('?');
    expect(resolveClassroomNameForProfile(undefined)).toBe('?');
  });
});
