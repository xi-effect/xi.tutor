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

export type ActivityShapeProps = {
  w: number;
  h: number;
  kind: ActivityKind;
  definition: ActivityDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
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

export const activityShapeProps = {
  w: T.number,
  h: T.number,
  kind: kindValidator,
  definition: T.any,
  attempt: T.any,
  checkStatus: checkStatusValidator,
};

export function getActivityDefaultProps(kind: ActivityKind = 'gap-text'): ActivityShapeProps {
  const definition = getDefaultDefinition(kind);
  const size = ACTIVITY_DEFAULT_SIZE[kind];
  return {
    w: size.w,
    h: size.h,
    kind,
    definition,
    attempt: createEmptyAttempt(definition),
    checkStatus: 'idle',
  };
}

export const ACTIVITY_SHAPE_TYPE = 'activity' as const;

export { ACTIVITY_MIN_SIZE };
