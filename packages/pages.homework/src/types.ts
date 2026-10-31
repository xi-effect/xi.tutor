import type { HomeworkContent } from 'modules.homework';

export type HomeworkTab = 'active' | 'templates' | 'archive';

export type HomeworkKind = 'assignment' | 'template';

export type HomeworkOriginFeed = 'active' | 'templates';

export type AssignmentStatus = 'draft' | 'assigned' | 'awaiting_review' | 'overdue' | 'completed';

export type StudentWorkState = 'not_submitted' | 'submitted' | 'reviewed';

export type HomeworkStudent = {
  id: string;
  name: string;
  state: StudentWorkState;
};

export type HomeworkItem = {
  id: string;
  kind: HomeworkKind;
  feed: HomeworkTab;
  originFeed: HomeworkOriginFeed;
  title: string;
  description: string;
  students: HomeworkStudent[];
  dueAt: string | null;
  questionCount: number;
  content: HomeworkContent;
  createdAt: string;
  updatedAt: string;
};

export const HOMEWORK_TABS: HomeworkTab[] = ['active', 'templates', 'archive'];

export const isHomeworkTab = (value: string): value is HomeworkTab =>
  value === 'active' || value === 'templates' || value === 'archive';

export const MAX_HOMEWORK_TITLE_LENGTH = 100;
export const MAX_HOMEWORK_DESCRIPTION_LENGTH = 300;
