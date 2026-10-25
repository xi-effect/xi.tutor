import { createMockHomework } from './mocks';
import type {
  HomeworkItem,
  HomeworkKind,
  HomeworkOriginFeed,
  HomeworkStudent,
  HomeworkTab,
  StudentWorkState,
} from './types';

const STORAGE_KEY = 'sovlium.homework.prototype.v1';

const isKind = (value: unknown): value is HomeworkKind =>
  value === 'assignment' || value === 'template';

const isFeed = (value: unknown): value is HomeworkTab =>
  value === 'active' || value === 'templates' || value === 'archive';

const isOriginFeed = (value: unknown): value is HomeworkOriginFeed =>
  value === 'active' || value === 'templates';

const isStudentState = (value: unknown): value is StudentWorkState =>
  value === 'not_submitted' || value === 'submitted' || value === 'reviewed';

const isStudent = (value: unknown): value is HomeworkStudent => {
  if (!value || typeof value !== 'object') return false;
  const student = value as Record<string, unknown>;
  return (
    typeof student.id === 'string' &&
    student.id.length > 0 &&
    typeof student.name === 'string' &&
    isStudentState(student.state)
  );
};

const isHomeworkItem = (value: unknown): value is HomeworkItem => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    isKind(item.kind) &&
    isFeed(item.feed) &&
    isOriginFeed(item.originFeed) &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.questionCount === 'number' &&
    (item.dueAt === null || typeof item.dueAt === 'string') &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string' &&
    Array.isArray(item.students) &&
    item.students.every(isStudent)
  );
};

export const readHomeworkLibrary = (): HomeworkItem[] => {
  if (typeof window === 'undefined') {
    return createMockHomework();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createMockHomework();

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return createMockHomework();

    const library = parsed as { version?: unknown; items?: unknown };
    if (library.version !== 1 || !Array.isArray(library.items)) return createMockHomework();
    if (!library.items.every(isHomeworkItem)) return createMockHomework();

    return library.items;
  } catch {
    return createMockHomework();
  }
};

export const writeHomeworkLibrary = (items: HomeworkItem[]) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items }));
  } catch {
    // Прототип продолжает работать в памяти вкладки.
  }
};
