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
  'gap-text': { w: 560, h: 340 },
  matching: { w: 560, h: 380 },
  sorting: { w: 580, h: 400 },
  ordering: { w: 420, h: 380 },
  'label-image': { w: 560, h: 440 },
  'multiple-choice': { w: 460, h: 340 },
  'mystery-tiles': { w: 420, h: 400 },
  'random-card': { w: 380, h: 280 },
};

export const ACTIVITY_MIN_SIZE = { w: 280, h: 200 };
