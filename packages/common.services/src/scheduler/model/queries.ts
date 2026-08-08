import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  schedulerApiConfig,
  SchedulerQueryKey,
  type CancelRepeatingEventAfterTimestampInputDto,
  type CreateClassroomEventRequestDto,
  type CreateClassroomEventResponseDto,
  type CreateLastRepetitionModeResponseDto,
  type DetailedEventInstanceDto,
  type EventInstanceDto,
  type EventInstanceTimeSlotInputDto,
  type GetEventInstanceDetailsResponseDto,
  type RepetitionModeInputDto,
  type UpdateClassroomEventRequestDto,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError } from '../../utils';
import { mapScheduleResponseToScheduleItems } from './adapters';
import type { ScheduleItem } from './types';
import {
  PRODUCT_ANALYTICS_EVENTS,
  createAttemptId,
  mapLessonCreateError,
  measureDurationMs,
  nowMs,
  trackProductEvent,
  type ProductAnalyticsLessonType,
  type ProductAnalyticsSource,
} from 'common.utils';

export type LessonCreatedAnalytics = {
  source: ProductAnalyticsSource;
  lesson_type: ProductAnalyticsLessonType;
  is_recurring: boolean;
  has_description: boolean;
  attempt_id?: string;
  started_at?: number;
  students_count?: number;
};

export type GetClassroomScheduleParams = {
  classroomId: number;
  happensAfter: string;
  happensBefore: string;
};

export type CreateClassroomEventParams = {
  classroomId: number;
  body: CreateClassroomEventRequestDto;
  analytics?: LessonCreatedAnalytics;
};

export type UpdateClassroomEventParams = {
  classroomId: number;
  eventId: number;
  body: UpdateClassroomEventRequestDto;
};

export type DeleteClassroomEventParams = {
  classroomId: number;
  eventId: number;
};

export type CancelEventInstanceParams = {
  classroomId: number;
  eventInstanceId: string;
};

export type UncancelEventInstanceParams = {
  classroomId: number;
  eventInstanceId: string;
};

export type CancelRepeatedVirtualInstanceParams = {
  classroomId: number;
  repetitionModeId: string;
  instanceIndex: number;
};

export type CancelRepeatingEventAfterTimestampParams = {
  classroomId: number;
  eventId: number;
  body: CancelRepeatingEventAfterTimestampInputDto;
};

export type GetEventInstanceDetailsParams = {
  classroomId: number;
  eventInstanceId: string;
};

export type GetRepeatedEventInstanceDetailsParams = {
  classroomId: number;
  repetitionModeId: string;
  instanceIndex: number;
};

export type GetGlobalScheduleParams = {
  happensAfter: string;
  happensBefore: string;
};

export type RescheduleRepeatedVirtualInstanceParams = {
  classroomId: number;
  repetitionModeId: string;
  instanceIndex: number;
  body: EventInstanceTimeSlotInputDto;
};

export type RescheduleSoleEventInstanceParams = {
  classroomId: number;
  eventInstanceId: string;
  body: EventInstanceTimeSlotInputDto;
};

export type CreateLastRepetitionModeParams = {
  classroomId: number;
  eventId: number;
  body: RepetitionModeInputDto;
};

export const schedulerQueryKeys = {
  tutorClassroomSchedule: (classroomId: number, happensAfter: string, happensBefore: string) =>
    ['tutor-classroom-schedule', classroomId, happensAfter, happensBefore] as const,

  studentClassroomSchedule: (classroomId: number, happensAfter: string, happensBefore: string) =>
    ['student-classroom-schedule', classroomId, happensAfter, happensBefore] as const,

  tutorAllForClassroom: (classroomId: number) => ['tutor-classroom-schedule', classroomId] as const,

  studentAllForClassroom: (classroomId: number) =>
    ['student-classroom-schedule', classroomId] as const,

  /** Глобальное расписание (без classroom_id). */
  tutorSchedule: (happensAfter: string, happensBefore: string) =>
    ['tutor-schedule', happensAfter, happensBefore] as const,
  studentSchedule: (happensAfter: string, happensBefore: string) =>
    ['student-schedule', happensAfter, happensBefore] as const,
  tutorScheduleAll: () => ['tutor-schedule'] as const,
  studentScheduleAll: () => ['student-schedule'] as const,

  tutorEventInstanceDetails: (classroomId: number, eventInstanceId: string) =>
    ['tutor-event-instance-details', classroomId, eventInstanceId] as const,

  studentEventInstanceDetails: (classroomId: number, eventInstanceId: string) =>
    ['student-event-instance-details', classroomId, eventInstanceId] as const,

  /** Префикс для invalidateQueries — все детали инстансов кабинета (см. useLessonInfoModal) */
  tutorEventInstanceDetailsForClassroom: (classroomId: number) =>
    ['tutor-event-instance-details', classroomId] as const,

  studentEventInstanceDetailsForClassroom: (classroomId: number) =>
    ['student-event-instance-details', classroomId] as const,

  tutorRepeatedEventInstanceDetails: (
    classroomId: number,
    repetitionModeId: string,
    instanceIndex: number,
  ) =>
    [
      'tutor-repeated-event-instance-details',
      classroomId,
      repetitionModeId,
      instanceIndex,
    ] as const,

  studentRepeatedEventInstanceDetails: (
    classroomId: number,
    repetitionModeId: string,
    instanceIndex: number,
  ) =>
    [
      'student-repeated-event-instance-details',
      classroomId,
      repetitionModeId,
      instanceIndex,
    ] as const,

  tutorRepeatedEventInstanceDetailsForClassroom: (classroomId: number) =>
    ['tutor-repeated-event-instance-details', classroomId] as const,

  studentRepeatedEventInstanceDetailsForClassroom: (classroomId: number) =>
    ['student-repeated-event-instance-details', classroomId] as const,
} as const;

export async function getTutorClassroomSchedule({
  classroomId,
  happensAfter,
  happensBefore,
}: GetClassroomScheduleParams): Promise<EventInstanceDto[]> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst<EventInstanceDto[]>({
    method: schedulerApiConfig[SchedulerQueryKey.GetTutorClassroomSchedule].method,
    url: schedulerApiConfig[SchedulerQueryKey.GetTutorClassroomSchedule].getUrl(
      classroomId.toString(),
    ),
    params: {
      happens_after: happensAfter,
      happens_before: happensBefore,
    },
  });

  return response.data;
}

export async function getStudentClassroomSchedule({
  classroomId,
  happensAfter,
  happensBefore,
}: GetClassroomScheduleParams): Promise<EventInstanceDto[]> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst<EventInstanceDto[]>({
    method: schedulerApiConfig[SchedulerQueryKey.GetStudentClassroomSchedule].method,
    url: schedulerApiConfig[SchedulerQueryKey.GetStudentClassroomSchedule].getUrl(
      classroomId.toString(),
    ),
    params: {
      happens_after: happensAfter,
      happens_before: happensBefore,
    },
  });

  return response.data;
}

export async function getTutorSchedule({
  happensAfter,
  happensBefore,
}: GetGlobalScheduleParams): Promise<DetailedEventInstanceDto[]> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst<DetailedEventInstanceDto[]>({
    method: schedulerApiConfig[SchedulerQueryKey.GetTutorSchedule].method,
    url: schedulerApiConfig[SchedulerQueryKey.GetTutorSchedule].getUrl(),
    params: {
      happens_after: happensAfter,
      happens_before: happensBefore,
    },
  });
  return response.data;
}

export async function getStudentSchedule({
  happensAfter,
  happensBefore,
}: GetGlobalScheduleParams): Promise<DetailedEventInstanceDto[]> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst<DetailedEventInstanceDto[]>({
    method: schedulerApiConfig[SchedulerQueryKey.GetStudentSchedule].method,
    url: schedulerApiConfig[SchedulerQueryKey.GetStudentSchedule].getUrl(),
    params: {
      happens_after: happensAfter,
      happens_before: happensBefore,
    },
  });
  return response.data;
}

export async function createClassroomEvent({
  classroomId,
  body,
}: CreateClassroomEventParams): Promise<CreateClassroomEventResponseDto> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst<CreateClassroomEventResponseDto>({
    method: schedulerApiConfig[SchedulerQueryKey.CreateClassroomEvent].method,
    url: schedulerApiConfig[SchedulerQueryKey.CreateClassroomEvent].getUrl(classroomId.toString()),
    data: body,
  });

  return response.data;
}

export async function updateClassroomEvent({
  classroomId,
  eventId,
  body,
}: UpdateClassroomEventParams): Promise<CreateClassroomEventResponseDto> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst<CreateClassroomEventResponseDto>({
    method: schedulerApiConfig[SchedulerQueryKey.UpdateClassroomEvent].method,
    url: schedulerApiConfig[SchedulerQueryKey.UpdateClassroomEvent].getUrl(
      classroomId.toString(),
      eventId.toString(),
    ),
    data: body,
  });

  return response.data;
}

export async function deleteClassroomEvent({
  classroomId,
  eventId,
}: DeleteClassroomEventParams): Promise<void> {
  const axiosInst = await getAxiosInstance();
  await axiosInst({
    method: schedulerApiConfig[SchedulerQueryKey.DeleteClassroomEvent].method,
    url: schedulerApiConfig[SchedulerQueryKey.DeleteClassroomEvent].getUrl(
      classroomId.toString(),
      eventId.toString(),
    ),
  });
}

export async function cancelEventInstance({
  classroomId,
  eventInstanceId,
}: CancelEventInstanceParams): Promise<void> {
  const axiosInst = await getAxiosInstance();
  await axiosInst({
    method: schedulerApiConfig[SchedulerQueryKey.CancelEventInstance].method,
    url: schedulerApiConfig[SchedulerQueryKey.CancelEventInstance].getUrl(
      classroomId.toString(),
      eventInstanceId,
    ),
  });
}

export async function uncancelEventInstance({
  classroomId,
  eventInstanceId,
}: UncancelEventInstanceParams): Promise<void> {
  const axiosInst = await getAxiosInstance();
  await axiosInst({
    method: schedulerApiConfig[SchedulerQueryKey.UncancelEventInstance].method,
    url: schedulerApiConfig[SchedulerQueryKey.UncancelEventInstance].getUrl(
      classroomId.toString(),
      eventInstanceId,
    ),
  });
}

export async function cancelRepeatedVirtualInstance({
  classroomId,
  repetitionModeId,
  instanceIndex,
}: CancelRepeatedVirtualInstanceParams): Promise<void> {
  const axiosInst = await getAxiosInstance();
  await axiosInst({
    method: schedulerApiConfig[SchedulerQueryKey.CancelRepeatedVirtualInstance].method,
    url: schedulerApiConfig[SchedulerQueryKey.CancelRepeatedVirtualInstance].getUrl(
      classroomId.toString(),
      repetitionModeId,
      instanceIndex,
    ),
  });
}

function invalidateClassroomSchedules(queryClient: QueryClient, classroomId: number) {
  queryClient.invalidateQueries({
    queryKey: schedulerQueryKeys.tutorAllForClassroom(classroomId),
  });
  queryClient.invalidateQueries({
    queryKey: schedulerQueryKeys.studentAllForClassroom(classroomId),
  });
}

function invalidateGlobalSchedules(queryClient: QueryClient) {
  queryClient.invalidateQueries({
    queryKey: schedulerQueryKeys.tutorScheduleAll(),
  });
  queryClient.invalidateQueries({
    queryKey: schedulerQueryKeys.studentScheduleAll(),
  });
}

/** После переноса слота: расписание + GET event-instance (модалка «Информация о занятии») */
function invalidateAfterRescheduleTimeSlot(queryClient: QueryClient, classroomId: number) {
  invalidateClassroomSchedules(queryClient, classroomId);
  invalidateGlobalSchedules(queryClient);
  queryClient.invalidateQueries({
    queryKey: schedulerQueryKeys.tutorEventInstanceDetailsForClassroom(classroomId),
  });
  queryClient.invalidateQueries({
    queryKey: schedulerQueryKeys.studentEventInstanceDetailsForClassroom(classroomId),
  });
  queryClient.invalidateQueries({
    queryKey: schedulerQueryKeys.tutorRepeatedEventInstanceDetailsForClassroom(classroomId),
  });
  queryClient.invalidateQueries({
    queryKey: schedulerQueryKeys.studentRepeatedEventInstanceDetailsForClassroom(classroomId),
  });
}

export type UseClassroomScheduleParams = {
  classroomId: number;
  happensAfter: string;
  happensBefore: string;
  enabled?: boolean;
};

export function useTutorClassroomSchedule({
  classroomId,
  happensAfter,
  happensBefore,
  enabled = true,
}: UseClassroomScheduleParams) {
  return useQuery<ScheduleItem[]>({
    queryKey: schedulerQueryKeys.tutorClassroomSchedule(classroomId, happensAfter, happensBefore),
    queryFn: async () => {
      const response = await getTutorClassroomSchedule({
        classroomId,
        happensAfter,
        happensBefore,
      });
      return mapScheduleResponseToScheduleItems(response, classroomId);
    },
    enabled: enabled && classroomId > 0,
  });
}

export function useStudentClassroomSchedule({
  classroomId,
  happensAfter,
  happensBefore,
  enabled = true,
}: UseClassroomScheduleParams) {
  return useQuery<ScheduleItem[]>({
    queryKey: schedulerQueryKeys.studentClassroomSchedule(classroomId, happensAfter, happensBefore),
    queryFn: async () => {
      const response = await getStudentClassroomSchedule({
        classroomId,
        happensAfter,
        happensBefore,
      });
      return mapScheduleResponseToScheduleItems(response, classroomId);
    },
    enabled: enabled && classroomId > 0,
  });
}

export function useCreateClassroomEvent() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateClassroomEventResponseDto,
    Error,
    CreateClassroomEventParams,
    { attemptId: string; startedAt: number; source: string }
  >({
    mutationFn: createClassroomEvent,
    onMutate: (variables) => {
      const attemptId = variables.analytics?.attempt_id ?? createAttemptId();
      const startedAt = variables.analytics?.started_at ?? nowMs();
      const source = variables.analytics?.source ?? 'unknown';

      if (variables.analytics) {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.LESSON_CREATE_SUBMIT, {
          attempt_id: attemptId,
          source,
          lesson_type: variables.analytics.lesson_type,
          is_recurring: variables.analytics.is_recurring,
        });
      }

      return { attemptId, startedAt, source };
    },
    onSuccess: (data, { classroomId, analytics }, context) => {
      invalidateClassroomSchedules(queryClient, classroomId);
      invalidateGlobalSchedules(queryClient);

      if (analytics) {
        const eventId =
          data && typeof data === 'object' && 'event' in data && data.event && 'id' in data.event
            ? String((data.event as { id: string | number }).id)
            : undefined;

        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.LESSON_CREATED_SUCCESS, {
          role: 'tutor',
          source: analytics.source,
          lesson_type: analytics.lesson_type,
          is_recurring: analytics.is_recurring,
          has_description: analytics.has_description,
          attempt_id: context?.attemptId ?? analytics.attempt_id,
          lesson_id: eventId,
          students_count: analytics.students_count ?? 1,
          duration_ms: context ? measureDurationMs(context.startedAt) : undefined,
        });
      }
    },
    onError: (err, variables, context) => {
      if (variables.analytics && context) {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.LESSON_CREATE_FAILED, {
          attempt_id: context.attemptId,
          source: context.source,
          reason: mapLessonCreateError(err),
          duration_ms: measureDurationMs(context.startedAt),
        });
      }
      handleError(err, 'scheduler');
    },
  });
}

export function useUpdateClassroomEvent() {
  const queryClient = useQueryClient();

  return useMutation<CreateClassroomEventResponseDto, Error, UpdateClassroomEventParams>({
    mutationFn: updateClassroomEvent,
    onSuccess: (_data, { classroomId }) => {
      invalidateClassroomSchedules(queryClient, classroomId);
      invalidateGlobalSchedules(queryClient);
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}

export function useDeleteClassroomEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteClassroomEventParams>({
    mutationFn: deleteClassroomEvent,
    onSuccess: (_data, { classroomId }) => {
      invalidateClassroomSchedules(queryClient, classroomId);
      invalidateGlobalSchedules(queryClient);
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}

export function useCancelEventInstance() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CancelEventInstanceParams>({
    mutationFn: cancelEventInstance,
    onSuccess: (_data, { classroomId }) => {
      invalidateClassroomSchedules(queryClient, classroomId);
      invalidateGlobalSchedules(queryClient);
      queryClient.invalidateQueries({
        queryKey: schedulerQueryKeys.tutorEventInstanceDetailsForClassroom(classroomId),
      });
      queryClient.invalidateQueries({
        queryKey: schedulerQueryKeys.studentEventInstanceDetailsForClassroom(classroomId),
      });
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}

export function useUncancelEventInstance() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UncancelEventInstanceParams>({
    mutationFn: uncancelEventInstance,
    onSuccess: (_data, { classroomId }) => {
      invalidateClassroomSchedules(queryClient, classroomId);
      invalidateGlobalSchedules(queryClient);
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}

export function useCancelRepeatedVirtualInstance() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CancelRepeatedVirtualInstanceParams>({
    mutationFn: cancelRepeatedVirtualInstance,
    onSuccess: (_data, { classroomId }) => {
      invalidateClassroomSchedules(queryClient, classroomId);
      invalidateGlobalSchedules(queryClient);
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}

export async function cancelRepeatingEventAfterTimestamp({
  classroomId,
  eventId,
  body,
}: CancelRepeatingEventAfterTimestampParams): Promise<void> {
  const axiosInst = await getAxiosInstance();
  await axiosInst({
    method: schedulerApiConfig[SchedulerQueryKey.CancelRepeatingEventAfterTimestamp].method,
    url: schedulerApiConfig[SchedulerQueryKey.CancelRepeatingEventAfterTimestamp].getUrl(
      classroomId.toString(),
      eventId.toString(),
    ),
    data: body,
  });
}

export function useCancelRepeatingEventAfterTimestamp() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CancelRepeatingEventAfterTimestampParams>({
    mutationFn: cancelRepeatingEventAfterTimestamp,
    onSuccess: (_data, { classroomId }) => {
      invalidateClassroomSchedules(queryClient, classroomId);
      invalidateGlobalSchedules(queryClient);
      queryClient.invalidateQueries({
        queryKey: schedulerQueryKeys.tutorEventInstanceDetailsForClassroom(classroomId),
      });
      queryClient.invalidateQueries({
        queryKey: schedulerQueryKeys.studentEventInstanceDetailsForClassroom(classroomId),
      });
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}

export type UseGlobalScheduleParams = {
  happensAfter: string;
  happensBefore: string;
  enabled?: boolean;
};

export function useTutorSchedule({
  happensAfter,
  happensBefore,
  enabled = true,
}: UseGlobalScheduleParams) {
  return useQuery<ScheduleItem[]>({
    queryKey: schedulerQueryKeys.tutorSchedule(happensAfter, happensBefore),
    queryFn: async () => {
      const response = await getTutorSchedule({ happensAfter, happensBefore });
      return mapScheduleResponseToScheduleItems(response, null);
    },
    enabled,
  });
}

export function useStudentSchedule({
  happensAfter,
  happensBefore,
  enabled = true,
}: UseGlobalScheduleParams) {
  return useQuery<ScheduleItem[]>({
    queryKey: schedulerQueryKeys.studentSchedule(happensAfter, happensBefore),
    queryFn: async () => {
      const response = await getStudentSchedule({ happensAfter, happensBefore });
      return mapScheduleResponseToScheduleItems(response, null);
    },
    enabled,
  });
}

export const useClassroomSchedule = useTutorClassroomSchedule;

export async function getTutorEventInstanceDetails({
  classroomId,
  eventInstanceId,
}: GetEventInstanceDetailsParams): Promise<GetEventInstanceDetailsResponseDto> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst<GetEventInstanceDetailsResponseDto>({
    method: schedulerApiConfig[SchedulerQueryKey.GetTutorEventInstanceDetails].method,
    url: schedulerApiConfig[SchedulerQueryKey.GetTutorEventInstanceDetails].getUrl(
      classroomId.toString(),
      eventInstanceId,
    ),
  });
  return response.data;
}

export async function getStudentEventInstanceDetails({
  classroomId,
  eventInstanceId,
}: GetEventInstanceDetailsParams): Promise<GetEventInstanceDetailsResponseDto> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst<GetEventInstanceDetailsResponseDto>({
    method: schedulerApiConfig[SchedulerQueryKey.GetStudentEventInstanceDetails].method,
    url: schedulerApiConfig[SchedulerQueryKey.GetStudentEventInstanceDetails].getUrl(
      classroomId.toString(),
      eventInstanceId,
    ),
  });
  return response.data;
}

export async function rescheduleRepeatedVirtualInstance({
  classroomId,
  repetitionModeId,
  instanceIndex,
  body,
}: RescheduleRepeatedVirtualInstanceParams): Promise<void> {
  const axiosInst = await getAxiosInstance();
  await axiosInst({
    method: schedulerApiConfig[SchedulerQueryKey.RescheduleRepeatedVirtualInstance].method,
    url: schedulerApiConfig[SchedulerQueryKey.RescheduleRepeatedVirtualInstance].getUrl(
      classroomId.toString(),
      repetitionModeId,
      instanceIndex,
    ),
    data: body,
  });
}

export async function rescheduleSoleEventInstance({
  classroomId,
  eventInstanceId,
  body,
}: RescheduleSoleEventInstanceParams): Promise<void> {
  const axiosInst = await getAxiosInstance();
  await axiosInst({
    method: schedulerApiConfig[SchedulerQueryKey.RescheduleSoleEventInstance].method,
    url: schedulerApiConfig[SchedulerQueryKey.RescheduleSoleEventInstance].getUrl(
      classroomId.toString(),
      eventInstanceId,
    ),
    data: body,
  });
}

export type UseEventInstanceDetailsParams = {
  classroomId: number;
  eventInstanceId: string;
  enabled?: boolean;
};

export function useTutorEventInstanceDetails({
  classroomId,
  eventInstanceId,
  enabled = true,
}: UseEventInstanceDetailsParams) {
  return useQuery<GetEventInstanceDetailsResponseDto>({
    queryKey: schedulerQueryKeys.tutorEventInstanceDetails(classroomId, eventInstanceId),
    queryFn: () => getTutorEventInstanceDetails({ classroomId, eventInstanceId }),
    enabled: enabled && classroomId > 0 && eventInstanceId.length > 0,
  });
}

export function useStudentEventInstanceDetails({
  classroomId,
  eventInstanceId,
  enabled = true,
}: UseEventInstanceDetailsParams) {
  return useQuery<GetEventInstanceDetailsResponseDto>({
    queryKey: schedulerQueryKeys.studentEventInstanceDetails(classroomId, eventInstanceId),
    queryFn: () => getStudentEventInstanceDetails({ classroomId, eventInstanceId }),
    enabled: enabled && classroomId > 0 && eventInstanceId.length > 0,
  });
}

export async function getTutorRepeatedEventInstanceDetails({
  classroomId,
  repetitionModeId,
  instanceIndex,
}: GetRepeatedEventInstanceDetailsParams): Promise<GetEventInstanceDetailsResponseDto> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst<GetEventInstanceDetailsResponseDto>({
    method: schedulerApiConfig[SchedulerQueryKey.GetTutorRepeatedEventInstanceDetails].method,
    url: schedulerApiConfig[SchedulerQueryKey.GetTutorRepeatedEventInstanceDetails].getUrl(
      classroomId.toString(),
      repetitionModeId,
      instanceIndex,
    ),
  });
  return response.data;
}

export async function getStudentRepeatedEventInstanceDetails({
  classroomId,
  repetitionModeId,
  instanceIndex,
}: GetRepeatedEventInstanceDetailsParams): Promise<GetEventInstanceDetailsResponseDto> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst<GetEventInstanceDetailsResponseDto>({
    method: schedulerApiConfig[SchedulerQueryKey.GetStudentRepeatedEventInstanceDetails].method,
    url: schedulerApiConfig[SchedulerQueryKey.GetStudentRepeatedEventInstanceDetails].getUrl(
      classroomId.toString(),
      repetitionModeId,
      instanceIndex,
    ),
  });
  return response.data;
}

export type UseRepeatedEventInstanceDetailsParams = {
  classroomId: number;
  repetitionModeId: string;
  instanceIndex: number;
  enabled?: boolean;
};

export function useTutorRepeatedEventInstanceDetails({
  classroomId,
  repetitionModeId,
  instanceIndex,
  enabled = true,
}: UseRepeatedEventInstanceDetailsParams) {
  return useQuery<GetEventInstanceDetailsResponseDto>({
    queryKey: schedulerQueryKeys.tutorRepeatedEventInstanceDetails(
      classroomId,
      repetitionModeId,
      instanceIndex,
    ),
    queryFn: () =>
      getTutorRepeatedEventInstanceDetails({ classroomId, repetitionModeId, instanceIndex }),
    enabled:
      enabled &&
      classroomId > 0 &&
      repetitionModeId.length > 0 &&
      Number.isInteger(instanceIndex) &&
      instanceIndex >= 0,
  });
}

export function useStudentRepeatedEventInstanceDetails({
  classroomId,
  repetitionModeId,
  instanceIndex,
  enabled = true,
}: UseRepeatedEventInstanceDetailsParams) {
  return useQuery<GetEventInstanceDetailsResponseDto>({
    queryKey: schedulerQueryKeys.studentRepeatedEventInstanceDetails(
      classroomId,
      repetitionModeId,
      instanceIndex,
    ),
    queryFn: () =>
      getStudentRepeatedEventInstanceDetails({ classroomId, repetitionModeId, instanceIndex }),
    enabled:
      enabled &&
      classroomId > 0 &&
      repetitionModeId.length > 0 &&
      Number.isInteger(instanceIndex) &&
      instanceIndex >= 0,
  });
}

export function useRescheduleRepeatedVirtualInstance() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RescheduleRepeatedVirtualInstanceParams>({
    mutationFn: rescheduleRepeatedVirtualInstance,
    onSuccess: (_data, { classroomId }) => {
      invalidateAfterRescheduleTimeSlot(queryClient, classroomId);
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}

export function useRescheduleSoleEventInstance() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RescheduleSoleEventInstanceParams>({
    mutationFn: rescheduleSoleEventInstance,
    onSuccess: (_data, { classroomId }) => {
      invalidateAfterRescheduleTimeSlot(queryClient, classroomId);
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}

export async function createLastRepetitionMode({
  classroomId,
  eventId,
  body,
}: CreateLastRepetitionModeParams): Promise<CreateLastRepetitionModeResponseDto> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst<CreateLastRepetitionModeResponseDto>({
    method: schedulerApiConfig[SchedulerQueryKey.CreateLastRepetitionMode].method,
    url: schedulerApiConfig[SchedulerQueryKey.CreateLastRepetitionMode].getUrl(
      classroomId.toString(),
      eventId.toString(),
    ),
    data: body,
  });
  return response.data;
}

export function useCreateLastRepetitionMode() {
  const queryClient = useQueryClient();

  return useMutation<CreateLastRepetitionModeResponseDto, Error, CreateLastRepetitionModeParams>({
    mutationFn: createLastRepetitionMode,
    onSuccess: (_data, { classroomId }) => {
      invalidateClassroomSchedules(queryClient, classroomId);
      invalidateGlobalSchedules(queryClient);
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}
