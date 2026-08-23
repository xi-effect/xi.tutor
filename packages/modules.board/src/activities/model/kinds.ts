export const ACTIVITY_KINDS = [
  'gap-text',
  'matching',
  'sorting',
  'ordering',
  'label-image',
  'multiple-choice',
  'mystery-tiles',
  'random-card',
] as const;

export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export const ACTIVITY_KIND_SET = new Set<string>(ACTIVITY_KINDS);

export function isActivityKind(value: unknown): value is ActivityKind {
  return typeof value === 'string' && ACTIVITY_KIND_SET.has(value);
}

export const ACTIVITY_DEFAULT_SIZE: Record<ActivityKind, { w: number; h: number }> = {
  'gap-text': { w: 560, h: 360 },
  matching: { w: 580, h: 400 },
  sorting: { w: 600, h: 420 },
  ordering: { w: 480, h: 400 },
  'label-image': { w: 580, h: 460 },
  'multiple-choice': { w: 480, h: 360 },
  'mystery-tiles': { w: 480, h: 420 },
  'random-card': { w: 420, h: 320 },
};

export const ACTIVITY_MIN_SIZE = { w: 280, h: 56 };
