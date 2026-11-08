export const TUTOR_FIRST_STEPS = [
  'navigation',
  'settings',
  'cabinet',
  'call',
  'workspace',
  'invite',
  'material',
  'lesson',
] as const;
export const STUDENT_FIRST_STEPS = ['join', 'classroom', 'schedule'] as const;

export const FIRST_STEPS_COLLAPSED = '__collapsed__';

export type TutorFirstStepId = (typeof TUTOR_FIRST_STEPS)[number];
export type StudentFirstStepId = (typeof STUDENT_FIRST_STEPS)[number];
export type FirstStepId = TutorFirstStepId | StudentFirstStepId;
export type FirstStepsRole = 'tutor' | 'student';
export type FirstStepMark = 'pending' | 'done' | 'skipped';

export type FirstStepView = {
  id: string;
  status: FirstStepMark;
  blocked: boolean;
};

export const stepsForRole = (role: FirstStepsRole): readonly FirstStepId[] =>
  role === 'tutor' ? TUTOR_FIRST_STEPS : STUDENT_FIRST_STEPS;

export const firstStepsTotal = (role: FirstStepsRole): number => stepsForRole(role).length;

export const isStepForRole = (role: FirstStepsRole, step: string): step is FirstStepId =>
  (stepsForRole(role) as readonly string[]).includes(step);

export const firstStepFlagKey = (
  role: FirstStepsRole,
  step: FirstStepId,
  kind: 'done' | 'skip',
): string => `fs.${role}.${step}.${kind}`;

export const countResolvedFirstSteps = (
  marks: Record<string, FirstStepMark>,
  role: FirstStepsRole,
): number =>
  stepsForRole(role).filter((step) => marks[step] === 'done' || marks[step] === 'skipped').length;

/** Пока число кабинетов неизвестно, шаг не блокируем: причина появится после загрузки. */
export const isTutorLessonBlocked = (classroomCount: number | null): boolean =>
  classroomCount === 0;

export const isStudentClassroomBlocked = (classroomCount: number | null): boolean =>
  classroomCount === 0;

export const pickExpandedStepId = (
  steps: FirstStepView[],
  pinnedId: string | null,
): string | null => {
  if (pinnedId === FIRST_STEPS_COLLAPSED) return null;
  if (pinnedId && steps.some((step) => step.id === pinnedId)) return pinnedId;

  return (
    steps.find((step) => step.status === 'pending' && !step.blocked)?.id ??
    steps.find((step) => step.status === 'pending')?.id ??
    null
  );
};
