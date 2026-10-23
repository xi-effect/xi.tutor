import {
  CLASSROOMS_SEARCH_MAX_LIMIT,
  getNextClassroomsCursor,
  type ClassroomCursor,
  type ClassroomT,
} from 'common.api';
import { searchTutorClassrooms } from './searchTutorClassrooms';

const MAX_PAGES = 20;

export async function loadAllTutorClassrooms(): Promise<ClassroomT[]> {
  const classrooms: ClassroomT[] = [];
  const seen = new Set<number>();
  let cursor: ClassroomCursor | null = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const batch = await searchTutorClassrooms(cursor, CLASSROOMS_SEARCH_MAX_LIMIT);

    batch.forEach((classroom) => {
      if (seen.has(classroom.id)) return;
      seen.add(classroom.id);
      classrooms.push(classroom);
    });

    const next = getNextClassroomsCursor(batch, CLASSROOMS_SEARCH_MAX_LIMIT);
    if (!next || next.created_at === cursor?.created_at) break;
    cursor = next;
  }

  return classrooms;
}
