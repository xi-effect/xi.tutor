import { useMemo } from 'react';
import { useCurrentUser } from 'common.services';
import {
  useStudentEventInstanceDetails,
  useStudentRepeatedEventInstanceDetails,
  useTutorEventInstanceDetails,
  useTutorRepeatedEventInstanceDetails,
} from 'modules.calendar';

/** Параметры запросов совпадают с `RepeatedVirtualRescheduleTarget` / `SoleRescheduleTarget` из `useMovingForm`. */
type SchedulerTargetArg = {
  classroomId: number;
  eventId: number;
  repetitionModeId: string;
  instanceIndex: number;
};
type SoleTargetArg = { classroomId: number; eventInstanceId: string };

export type MovingRepetitionResolution = {
  /** Серия каждый день (`repetition_mode.kind === daily` или подсказка из расписания). */
  isDailySeries: boolean;
  /** UTC-битмаска (`weekly_starting_bitmask`), только для weekly. */
  bitmaskUtc?: number;
};

export type UseMovingRepetitionResolutionParams = {
  enabled: boolean;
  schedulerTarget?: SchedulerTargetArg;
  soleTarget?: SoleTargetArg;
  /** Из тонкого расписания: `weekly_starting_bitmask` в UTC */
  scheduleWeeklyBitmaskUtc?: number;
  /** Из расписания: `repetition_kind` у серии */
  scheduleRepetitionKind?: 'daily' | 'weekly' | null;
};

/**
 * Сводит режим повторения для формы переноса:
 * для daily битмаски нет — дни недели задаются семью выбранными днями, не через UTC-маску.
 */
export const useMovingRepetitionResolution = ({
  enabled,
  schedulerTarget,
  soleTarget,
  scheduleWeeklyBitmaskUtc,
  scheduleRepetitionKind,
}: UseMovingRepetitionResolutionParams): MovingRepetitionResolution => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const isVirtual = enabled && schedulerTarget != null;
  const isPersisted = enabled && schedulerTarget == null && soleTarget != null;

  const virtualTutorQuery = useTutorRepeatedEventInstanceDetails({
    classroomId: schedulerTarget?.classroomId ?? 0,
    repetitionModeId: schedulerTarget?.repetitionModeId ?? '',
    instanceIndex: schedulerTarget?.instanceIndex ?? -1,
    enabled: isVirtual && isTutor === true,
  });
  const virtualStudentQuery = useStudentRepeatedEventInstanceDetails({
    classroomId: schedulerTarget?.classroomId ?? 0,
    repetitionModeId: schedulerTarget?.repetitionModeId ?? '',
    instanceIndex: schedulerTarget?.instanceIndex ?? -1,
    enabled: isVirtual && isTutor === false,
  });
  const persistedTutorQuery = useTutorEventInstanceDetails({
    classroomId: soleTarget?.classroomId ?? 0,
    eventInstanceId: soleTarget?.eventInstanceId ?? '',
    enabled: isPersisted && isTutor === true,
  });
  const persistedStudentQuery = useStudentEventInstanceDetails({
    classroomId: soleTarget?.classroomId ?? 0,
    eventInstanceId: soleTarget?.eventInstanceId ?? '',
    enabled: isPersisted && isTutor === false,
  });

  const detailed =
    virtualTutorQuery.data ??
    virtualStudentQuery.data ??
    persistedTutorQuery.data ??
    persistedStudentQuery.data;

  const repetitionMode =
    detailed && 'repetition_mode' in detailed ? detailed.repetition_mode : undefined;

  const detailKind = repetitionMode?.kind;
  const detailWeeklyMask =
    detailKind === 'weekly' ? (repetitionMode?.weekly_starting_bitmask ?? null) : null;

  return useMemo((): MovingRepetitionResolution => {
    if (detailKind === 'daily') {
      return { isDailySeries: true };
    }

    if (detailKind === 'weekly' && detailWeeklyMask != null) {
      return { isDailySeries: false, bitmaskUtc: detailWeeklyMask };
    }

    if (scheduleRepetitionKind === 'daily') {
      return { isDailySeries: true };
    }

    if (scheduleWeeklyBitmaskUtc != null) {
      return { isDailySeries: false, bitmaskUtc: scheduleWeeklyBitmaskUtc };
    }

    return { isDailySeries: false, bitmaskUtc: undefined };
  }, [detailKind, detailWeeklyMask, scheduleRepetitionKind, scheduleWeeklyBitmaskUtc]);
};
