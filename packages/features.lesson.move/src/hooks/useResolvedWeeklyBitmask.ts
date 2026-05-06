import { useCurrentUser } from 'common.services';
import {
  useStudentEventInstanceDetails,
  useStudentRepeatedEventInstanceDetails,
  useTutorEventInstanceDetails,
  useTutorRepeatedEventInstanceDetails,
} from 'modules.calendar';
import type { RepeatedVirtualRescheduleTarget, SoleRescheduleTarget } from './useMovingForm';

type UseResolvedWeeklyBitmaskParams = {
  /** Включён ли ресолв вообще (например, модалка открыта и lessonKind === 'recurring') */
  enabled: boolean;
  /** Параметры для repeated_virtual — fetch /repetition-modes/{id}/instances/{n}/ */
  schedulerTarget?: RepeatedVirtualRescheduleTarget;
  /** Параметры для sole / repeated_persisted — fetch /event-instances/{id}/ */
  soleTarget?: SoleRescheduleTarget;
  /** Заранее известная UTC-битмаска (например, прилетела из global schedule с `repetition_mode`). */
  fallback?: number;
};

/**
 * Достаёт `weekly_starting_bitmask` через детальные ручки планировщика,
 * когда расписание кабинета вернуло «тонкий» инстанс без вложенного `repetition_mode`.
 *
 * Логика выбора ручки совпадает с переносом:
 *   schedulerTarget (virtual) → tutor/student RepeatedEventInstanceDetails
 *   soleTarget (sole / repeated_persisted) → tutor/student EventInstanceDetails
 *
 * Возвращает `fallback`, если детальный запрос ещё не выполнен, ничего не вернул
 * или сервер не приложил `repetition_mode` к ответу.
 */
export const useResolvedWeeklyBitmask = ({
  enabled,
  schedulerTarget,
  soleTarget,
  fallback,
}: UseResolvedWeeklyBitmaskParams): number | undefined => {
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

  if (repetitionMode?.kind === 'weekly' && repetitionMode.weekly_starting_bitmask != null) {
    return repetitionMode.weekly_starting_bitmask;
  }

  return fallback;
};
