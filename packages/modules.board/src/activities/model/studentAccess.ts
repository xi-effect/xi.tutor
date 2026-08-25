export type ActivityStudentAccess = {
  canInteract: boolean;
  canCheck: boolean;
  canReset: boolean;
  canReveal: boolean;
};

export const ACTIVITY_STUDENT_ACCESS_KEYS = [
  'canInteract',
  'canCheck',
  'canReset',
  'canReveal',
] as const;

export type ActivityStudentAccessKey = (typeof ACTIVITY_STUDENT_ACCESS_KEYS)[number];

export const DEFAULT_ACTIVITY_STUDENT_ACCESS: ActivityStudentAccess = {
  canInteract: true,
  canCheck: true,
  canReset: true,
  canReveal: false,
};

export function normalizeStudentAccess(value: unknown): ActivityStudentAccess {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    canInteract: source.canInteract !== false,
    canCheck: source.canCheck !== false,
    canReset: source.canReset !== false,
    canReveal: source.canReveal === true,
  };
}

export function studentAccessFlag(
  shapes: { props: { studentAccess?: unknown } }[],
  key: ActivityStudentAccessKey,
): { checked: boolean; mixed: boolean } {
  if (shapes.length === 0) return { checked: false, mixed: false };
  const values = shapes.map((shape) => normalizeStudentAccess(shape.props.studentAccess)[key]);
  const checked = values.every(Boolean);
  const mixed = !checked && values.some(Boolean);
  return { checked, mixed };
}
