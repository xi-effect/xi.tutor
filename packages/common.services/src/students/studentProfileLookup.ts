import type { TutorStudentSchemaMarshal } from 'common.types';

export type StudentProfileFromList = {
  username: string;
  display_name: string | null;
  name: string | null;
};

export const findStudentProfile = (
  students: TutorStudentSchemaMarshal[] | undefined,
  studentId: number,
): StudentProfileFromList | undefined => {
  if (!studentId || !Array.isArray(students)) return undefined;

  const match = students.find((student) => student.tutorship?.student_id === studentId);
  if (!match?.user) return undefined;

  return {
    username: match.user.username,
    display_name: match.user.display_name,
    name: match.user.display_name,
  };
};

export const shouldRequestStudentById = ({
  skip,
  listSettled,
  hasProfile,
}: {
  skip: boolean;
  listSettled: boolean;
  hasProfile: boolean;
}) => !skip && listSettled && !hasProfile;

/** Потолок `limit` у GET /roles/tutor/students/. Значение больше 100 бэкенд отвечает 422. */
export const STUDENTS_LIST_PAGE_LIMIT = 100;

const STUDENTS_LIST_MAX_PAGES = 30;

export const nextStudentsPageCursor = (
  page: TutorStudentSchemaMarshal[],
  limit = STUDENTS_LIST_PAGE_LIMIT,
): string | undefined => {
  if (page.length < limit) return undefined;
  const createdAt = page[page.length - 1]?.tutorship?.created_at;
  return createdAt || undefined;
};

export const collectTutorStudentPages = async (
  fetchPage: (cursor?: string) => Promise<TutorStudentSchemaMarshal[]>,
): Promise<TutorStudentSchemaMarshal[]> => {
  const students: TutorStudentSchemaMarshal[] = [];
  let cursor: string | undefined;

  for (let pageIndex = 0; pageIndex < STUDENTS_LIST_MAX_PAGES; pageIndex += 1) {
    const page = await fetchPage(cursor);
    if (!Array.isArray(page)) {
      throw new Error('Students list page is not an array');
    }
    if (page.length === 0) break;

    students.push(...page);
    const nextCursor = nextStudentsPageCursor(page);
    if (!nextCursor || nextCursor === cursor) break;
    cursor = nextCursor;
  }

  return students;
};
