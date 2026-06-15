import type { LessonDurationThresholdMin } from 'common.utils';

export type CallSessionAnalyticsState = {
  connectedAt: number | null;
  sentDurationThresholds: Set<LessonDurationThresholdMin>;
  duration5Reached: boolean;
  usedBoard: boolean;
  usedScreenshare: boolean;
  lessonFinishedSent: boolean;
  callConnectedSent: boolean;
  lessonStartedSent: boolean;
  lessonJoinedSent: boolean;
};

export const createCallSessionAnalyticsState = (): CallSessionAnalyticsState => ({
  connectedAt: null,
  sentDurationThresholds: new Set(),
  duration5Reached: false,
  usedBoard: false,
  usedScreenshare: false,
  lessonFinishedSent: false,
  callConnectedSent: false,
  lessonStartedSent: false,
  lessonJoinedSent: false,
});

let callSessionState = createCallSessionAnalyticsState();

export const getCallSessionAnalyticsState = (): CallSessionAnalyticsState => callSessionState;

export const resetCallSessionAnalyticsState = (): void => {
  callSessionState = createCallSessionAnalyticsState();
};
