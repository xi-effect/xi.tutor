export const ACTIVITY_KINDS = [
  'gap-text',
  'matching',
  'sorting',
  'ordering',
  'label-image',
  'multiple-choice',
  'mystery-tiles',
  'random-card',
  'exercise',
  'flip-card',
] as const;

export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

/** Упражнения, которые живут в документе. Флип-карточка — отдельная фигура холста. */
export const DOCUMENT_ACTIVITY_KINDS = ACTIVITY_KINDS.filter(
  (kind): kind is Exclude<ActivityKind, 'flip-card'> => kind !== 'flip-card',
);

/** Упражнение из банка создаётся только вставкой задания, не из каталога. */
export const CREATABLE_ACTIVITY_KINDS = ACTIVITY_KINDS.filter(
  (kind): kind is Exclude<ActivityKind, 'exercise'> => kind !== 'exercise',
);

export const CREATABLE_DOCUMENT_ACTIVITY_KINDS = DOCUMENT_ACTIVITY_KINDS.filter(
  (kind): kind is Exclude<ActivityKind, 'flip-card' | 'exercise'> => kind !== 'exercise',
);

export const ACTIVITY_KIND_SET = new Set<string>(ACTIVITY_KINDS);

export function isActivityKind(value: unknown): value is ActivityKind {
  return typeof value === 'string' && ACTIVITY_KIND_SET.has(value);
}

export const ACTIVITY_DEFAULT_SIZE: Record<ActivityKind, { w: number; h: number }> = {
  'gap-text': { w: 560, h: 360 },
  matching: { w: 720, h: 400 },
  sorting: { w: 600, h: 420 },
  ordering: { w: 480, h: 400 },
  'label-image': { w: 580, h: 460 },
  'multiple-choice': { w: 480, h: 360 },
  'mystery-tiles': { w: 480, h: 420 },
  'random-card': { w: 420, h: 320 },
  exercise: { w: 560, h: 420 },
  'flip-card': { w: 160, h: 260 },
};

export const ACTIVITY_MIN_SIZE = { w: 280, h: 56 };
