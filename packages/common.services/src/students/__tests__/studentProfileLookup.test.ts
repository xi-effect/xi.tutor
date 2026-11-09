import { describe, expect, it } from 'vitest';
import type { TutorStudentSchemaMarshal } from 'common.types';
import {
  collectTutorStudentPages,
  findStudentProfile,
  nextStudentsPageCursor,
  shouldRequestStudentById,
  STUDENTS_LIST_PAGE_LIMIT,
} from '../studentProfileLookup';

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

const pageOf = (count: number, createdAt: string): TutorStudentSchemaMarshal[] =>
  Array.from({ length: count }, (_, index) => ({
    tutorship: {
      student_id: index + 1,
      created_at: createdAt,
      active_classroom_count: 0,
    },
    user: { username: `user-${index}`, display_name: null },
  }));

describe('nextStudentsPageCursor', () => {
  it('листает дальше, только если страница заполнена до лимита', () => {
    const fullPage = pageOf(STUDENTS_LIST_PAGE_LIMIT, '2026-03-01T00:00:00Z');
    expect(nextStudentsPageCursor(fullPage)).toBe('2026-03-01T00:00:00Z');
    expect(nextStudentsPageCursor(fullPage.slice(0, 50))).toBeUndefined();
  });
});

describe('collectTutorStudentPages', () => {
  it('склеивает страницы по created_before и останавливается на короткой', async () => {
    const cursors: Array<string | undefined> = [];
    const students = await collectTutorStudentPages(async (cursor) => {
      cursors.push(cursor);
      if (!cursor) return pageOf(STUDENTS_LIST_PAGE_LIMIT, '2026-03-02T00:00:00Z');
      return pageOf(2, '2026-03-01T00:00:00Z');
    });

    expect(cursors).toEqual([undefined, '2026-03-02T00:00:00Z']);
    expect(students).toHaveLength(STUDENTS_LIST_PAGE_LIMIT + 2);
  });
});
