import { T, DrBaseShape } from '@ibodr/draw';
import {
  ACTIVITY_DEFAULT_SIZE,
  ACTIVITY_KINDS,
  ACTIVITY_MIN_SIZE,
  isActivityKind,
  type ActivityKind,
} from '../model/kinds';
import { getDefaultDefinition, createEmptyAttempt } from '../model/defaults';
import type { ActivityAttempt, ActivityDefinition, CheckStatus } from '../model/types';
import {
  DEFAULT_ACTIVITY_STUDENT_ACCESS,
  normalizeStudentAccess,
  type ActivityStudentAccess,
} from '../model/studentAccess';

export type ActivityShapeProps = {
  w: number;
  h: number;
  kind: ActivityKind;
  title: string;
  definition: ActivityDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  studentAccess: ActivityStudentAccess;
};

export type ActivityShape = DrBaseShape<'activity', ActivityShapeProps>;

declare module '@ibodr/draw' {
  export interface DrGlobalShapePropsMap {
    activity: ActivityShapeProps;
  }
}

const kindValidator = {
  validate(value: unknown): ActivityKind {
    return isActivityKind(value) ? value : ACTIVITY_KINDS[0];
  },
  validateUsingKnownGoodVersion(_known: ActivityKind, value: unknown): ActivityKind {
    return isActivityKind(value) ? value : ACTIVITY_KINDS[0];
  },
};

const checkStatusValidator = {
  validate(value: unknown): CheckStatus {
    if (value === 'checked' || value === 'revealed' || value === 'idle') return value;
    return 'idle';
  },
  validateUsingKnownGoodVersion(_known: CheckStatus, value: unknown): CheckStatus {
    if (value === 'checked' || value === 'revealed' || value === 'idle') return value;
    return 'idle';
  },
};

const titleValidator = {
  validate(value: unknown): string {
    return typeof value === 'string' ? value : '';
  },
  validateUsingKnownGoodVersion(_known: string, value: unknown): string {
    return typeof value === 'string' ? value : '';
  },
};

const studentAccessValidator = {
  validate(value: unknown): ActivityStudentAccess {
    return normalizeStudentAccess(value);
  },
  validateUsingKnownGoodVersion(
    _known: ActivityStudentAccess,
    value: unknown,
  ): ActivityStudentAccess {
    return normalizeStudentAccess(value);
  },
};

export const activityShapeProps = {
  w: T.number,
  h: T.number,
  kind: kindValidator,
  title: titleValidator,
  definition: T.any,
  attempt: T.any,
  checkStatus: checkStatusValidator,
  studentAccess: studentAccessValidator,
};

export function getActivityDefaultProps(kind: ActivityKind = 'gap-text'): ActivityShapeProps {
  const definition = getDefaultDefinition(kind);
  const size = ACTIVITY_DEFAULT_SIZE[kind];
  return {
    w: size.w,
    h: size.h,
    kind,
    title: '',
    definition,
    attempt: createEmptyAttempt(definition),
    checkStatus: 'idle',
    studentAccess: DEFAULT_ACTIVITY_STUDENT_ACCESS,
  };
}

export const ACTIVITY_SHAPE_TYPE = 'activity' as const;

export { ACTIVITY_MIN_SIZE };
