import { isStepForRole, type FirstStepId, type FirstStepsRole } from './model';

export type FirstStepsTourAnchor =
  | 'sidebar-sections'
  | 'user-profile'
  | 'home'
  | 'classrooms'
  | 'schedule'
  | 'materials'
  | 'students'
  | 'bank'
  | 'payments'
  | 'notifications'
  | 'sidebar-toggle'
  | 'user-menu'
  | 'settings-item'
  | 'support-item'
  | 'support-menu'
  | 'theme'
  | 'classroom-header'
  | 'classroom-lessons'
  | 'classroom-materials'
  | 'demo-classroom-card'
  | 'classroom-nav'
  | 'start-call'
  | 'board'
  | 'note'
  | 'schedule-page'
  | 'invite-action'
  | 'material-action'
  | 'lesson-action';

export type FirstStepsTourPlace =
  'current' | 'home' | 'classrooms' | 'classroom' | 'board' | 'note' | 'schedule' | 'appearance';

export type FirstStepsTourStop = {
  anchor: FirstStepsTourAnchor;
  place: FirstStepsTourPlace;
  side?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * «Продолжить» показывает действие и выполняет его.
   * Без флага шаг только объясняет.
   */
  click?:
    | 'sidebar-toggle'
    | 'open-user-menu'
    | 'hover-support'
    | 'open-classrooms'
    | 'open-demo-classroom';
};

export type FirstStepsTourSession = {
  step: FirstStepId;
  role: FirstStepsRole;
  userId: number;
  classroomId: string | null;
  boardId: string | null;
  noteId: string | null;
  index: number;
};

export const FIRST_STEPS_TOUR_EVENT = 'first-steps-tour';
export const FIRST_STEPS_TOUR_ACTION_EVENT = 'first-steps-tour-action';
export const FIRST_STEPS_OPEN_USER_MENU_EVENT = 'first-steps-open-user-menu';
export const FIRST_STEPS_CLOSE_USER_MENU_EVENT = 'first-steps-close-user-menu';
export const FIRST_STEPS_EXPAND_SIDEBAR_EVENT = 'first-steps-expand-sidebar';

const STORAGE_KEY = 'sovlium.firstSteps.tour';

export const FIRST_STEPS_TOUR_SELECTORS: Record<FirstStepsTourAnchor, string> = {
  'sidebar-sections': '#sidebar-sections',
  'user-profile': '#hints-button',
  home: '#home-menu-item',
  classrooms: '#classrooms-menu-item',
  schedule: '#calendar-menu-item',
  'user-menu': '[data-first-step="user-menu"]',
  'settings-item': '[data-first-step="settings-item"]',
  'support-item': '[data-first-step="support-item"]',
  'support-menu': '#first-steps-support-focus',
  theme: '[data-first-step="theme"]',
  materials: '#materials-menu-item',
  students: '#students-menu-item',
  bank: '#bank-menu-item',
  payments: '#payments-menu-item',
  notifications: '#notifications-menu-item',
  'sidebar-toggle': '#sidebar-toggle',
  'classroom-header': '[data-first-step="classroom-header"]',
  'classroom-lessons': '[data-first-step="classroom-lessons"]',
  'classroom-materials': '[data-first-step="classroom-materials"]',
  'demo-classroom-card': '[data-first-step="demo-classroom-card"]',
  'classroom-nav': '[data-first-step="classroom-nav"]',
  'start-call': '[data-first-step="start-call"]',
  board: '[data-board-toolbar-dock]',
  note: '[data-first-step="note-editor"]',
  'schedule-page': '[data-first-step="schedule"]',
  'invite-action': '[data-first-step="invite-action"]',
  'material-action': '[data-first-step="material-action"]',
  'lesson-action': '[data-first-step="lesson-action"]',
};

export const FIRST_STEPS_TOUR_STOPS: Record<FirstStepId, readonly FirstStepsTourStop[]> = {
  navigation: [
    { anchor: 'sidebar-sections', place: 'current', side: 'right' },
    { anchor: 'notifications', place: 'current', side: 'right' },
    { anchor: 'user-profile', place: 'current', side: 'right' },
    { anchor: 'sidebar-toggle', place: 'current', side: 'bottom', click: 'sidebar-toggle' },
  ],
  settings: [
    { anchor: 'user-profile', place: 'current', side: 'right', click: 'open-user-menu' },
    { anchor: 'user-menu', place: 'current', side: 'right' },
    { anchor: 'settings-item', place: 'current', side: 'right', click: 'hover-support' },
    { anchor: 'support-menu', place: 'current', side: 'top' },
  ],
  cabinet: [
    { anchor: 'classrooms', place: 'current', side: 'right', click: 'open-classrooms' },
    {
      anchor: 'demo-classroom-card',
      place: 'classrooms',
      side: 'bottom',
      click: 'open-demo-classroom',
    },
    { anchor: 'classroom-nav', place: 'classroom', side: 'bottom' },
  ],
  call: [{ anchor: 'start-call', place: 'classroom' }],
  workspace: [
    { anchor: 'board', place: 'board' },
    { anchor: 'note', place: 'note' },
  ],
  invite: [
    { anchor: 'students', place: 'current' },
    { anchor: 'invite-action', place: 'home' },
  ],
  material: [
    { anchor: 'materials', place: 'current' },
    { anchor: 'material-action', place: 'home' },
  ],
  lesson: [
    { anchor: 'schedule', place: 'current' },
    { anchor: 'lesson-action', place: 'home' },
  ],
  join: [{ anchor: 'classrooms', place: 'current' }],
  classroom: [
    { anchor: 'classrooms', place: 'current' },
    { anchor: 'classroom-header', place: 'classroom' },
  ],
  schedule: [
    { anchor: 'schedule', place: 'current' },
    { anchor: 'schedule-page', place: 'schedule' },
  ],
};

const ACTION_ANCHORS = new Set<FirstStepsTourAnchor>([
  'invite-action',
  'material-action',
  'lesson-action',
]);

export const tourStopOpensAction = (anchor: FirstStepsTourAnchor): boolean =>
  ACTION_ANCHORS.has(anchor);

/** Тур сам отмечает только обзорные шаги. Остальные засчитываются реальным действием. */
export const tourCompletionMarksStep = (step: FirstStepId): boolean =>
  step === 'navigation' || step === 'settings' || step === 'cabinet' || step === 'workspace';

export const tourStopPath = (
  stop: FirstStepsTourStop,
  session: FirstStepsTourSession,
): string | null => {
  if (stop.place === 'current') return null;
  if (stop.place === 'home') return '/';
  if (stop.place === 'schedule') return '/schedule';
  if (stop.place === 'classrooms') return '/classrooms';
  if (stop.place === 'appearance') return '/settings/appearance';

  const classroomId = session.classroomId;
  if (!classroomId) return null;
  if (stop.place === 'classroom') return `/classrooms/${classroomId}`;
  if (stop.place === 'board' && session.boardId) {
    return `/classrooms/${classroomId}/boards/${session.boardId}`;
  }
  if (stop.place === 'note' && session.noteId) {
    return `/classrooms/${classroomId}/notes/${session.noteId}`;
  }
  return null;
};

export const isOnTourPath = (pathname: string, path: string | null): boolean => {
  if (path == null) return true;
  if (path === '/') return pathname === '/';
  return pathname === path || pathname === `${path}/`;
};

const isSession = (value: unknown): value is FirstStepsTourSession => {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<FirstStepsTourSession>;
  return (
    (session.role === 'tutor' || session.role === 'student') &&
    typeof session.step === 'string' &&
    isStepForRole(session.role, session.step) &&
    typeof session.userId === 'number' &&
    typeof session.index === 'number' &&
    (session.classroomId == null || typeof session.classroomId === 'string') &&
    (session.boardId == null || typeof session.boardId === 'string') &&
    (session.noteId == null || typeof session.noteId === 'string')
  );
};

export const readFirstStepsTour = (): FirstStepsTourSession | null => {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as unknown;
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const requestFirstStepsTour = (session: Omit<FirstStepsTourSession, 'index'>): void => {
  if (typeof sessionStorage === 'undefined') return;
  const next: FirstStepsTourSession = { ...session, index: 0 };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(FIRST_STEPS_TOUR_EVENT));
};

export const writeFirstStepsTourIndex = (index: number): void => {
  const session = readFirstStepsTour();
  if (!session || typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...session, index }));
};

export const clearFirstStepsTour = (): void => {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
};
