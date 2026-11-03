import { describe, expect, it } from 'vitest';
import type { TutorStudentSchemaMarshal } from 'common.types';
import { findStudentProfile, shouldRequestStudentById } from '../studentProfileLookup';

const students: TutorStudentSchemaMarshal[] = [
  {
    tutorship: { student_id: 7, created_at: '2026-01-01', active_classroom_count: 1 },
    user: { username: 'anna', display_name: 'Анна' },
  },
  {
    tutorship: { student_id: 8, created_at: '2026-01-02', active_classroom_count: 0 },
    user: { username: 'boris', display_name: null },
  },
];

describe('findStudentProfile', () => {
  it('берёт имя из списка учеников', () => {
    expect(findStudentProfile(students, 7)).toEqual({
      username: 'anna',
      display_name: 'Анна',
      name: 'Анна',
    });
  });

  it('оставляет пустое имя, если в списке его нет', () => {
    expect(findStudentProfile(students, 8)).toEqual({
      username: 'boris',
      display_name: null,
      name: null,
    });
  });

  it('не находит ученика вне списка', () => {
    expect(findStudentProfile(students, 9)).toBeUndefined();
    expect(findStudentProfile(undefined, 7)).toBeUndefined();
    expect(findStudentProfile(students, 0)).toBeUndefined();
  });
});

describe('shouldRequestStudentById', () => {
  it('ждёт список и не запрашивает карточку', () => {
    expect(shouldRequestStudentById({ skip: false, listSettled: false, hasProfile: false })).toBe(
      false,
    );
  });

  it('не запрашивает карточку, если профиль уже есть в списке', () => {
    expect(shouldRequestStudentById({ skip: false, listSettled: true, hasProfile: true })).toBe(
      false,
    );
  });

  it('запрашивает карточку, когда список получен, а ученика в нём нет', () => {
    expect(shouldRequestStudentById({ skip: false, listSettled: true, hasProfile: false })).toBe(
      true,
    );
  });

  it('ничего не запрашивает, когда хук выключен', () => {
    expect(shouldRequestStudentById({ skip: true, listSettled: true, hasProfile: false })).toBe(
      false,
    );
  });
});
