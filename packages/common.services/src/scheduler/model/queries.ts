import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  schedulerApiConfig,
  SchedulerQueryKey,
  type CreateClassroomEventRequestDto,
  type EventInstanceDto,
  type SchedulerEventDto,
  type UpdateClassroomEventRequestDto,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError } from '../../utils';
import { mapScheduleResponseToScheduleItems } from './adapters';
import type { ScheduleItem } from './types';

export interface GetClassroomScheduleParams {
  classroomId: number;
  happensAfter: string;
  happensBefore: string;
}

export interface CreateClassroomEventParams {
  classroomId: number;
  body: CreateClassroomEventRequestDto;
}

export interface UpdateClassroomEventParams {
  classroomId: number;
  eventId: number;
  body: UpdateClassroomEventRequestDto;
}

export interface DeleteClassroomEventParams {
  classroomId: number;
  eventId: number;
}

export interface CancelEventInstanceParams {
  classroomId: number;
  eventInstanceId: string;
}

export interface UncancelEventInstanceParams {
  classroomId: number;
  eventInstanceId: string;
}

export interface CancelRepeatedVirtualInstanceParams {
  classroomId: number;
  repetitionModeId: string;
  instanceIndex: number;
}

export const schedulerQueryKeys = {
  tutorClassroomSchedule: (classroomId: number, happensAfter: string, happensBefore: string) =>
    ['tutor-classroom-schedule', classroomId, happensAfter, happensBefore] as const,

  studentClassroomSchedule: (classroomId: number, happensAfter: string, happensBefore: string) =>
    ['student-classroom-schedule', classroomId, happensAfter, happensBefore] as const,

  tutorAllForClassroom: (classroomId: number) => ['tutor-classroom-schedule', classroomId] as const,

  studentAllForClassroom: (classroomId: number) =>
    ['student-classroom-schedule', classroomId] as const,
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

export async function createClassroomEvent({
  classroomId,
  body,
}: CreateClassroomEventParams): Promise<SchedulerEventDto> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst<SchedulerEventDto>({
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
}: UpdateClassroomEventParams): Promise<SchedulerEventDto> {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst<SchedulerEventDto>({
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

export interface UseClassroomScheduleParams {
  classroomId: number;
  happensAfter: string;
  happensBefore: string;
  enabled?: boolean;
}

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

  return useMutation<SchedulerEventDto, Error, CreateClassroomEventParams>({
    mutationFn: createClassroomEvent,
    onSuccess: (_data, { classroomId }) => {
      invalidateClassroomSchedules(queryClient, classroomId);
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}

export function useUpdateClassroomEvent() {
  const queryClient = useQueryClient();

  return useMutation<SchedulerEventDto, Error, UpdateClassroomEventParams>({
    mutationFn: updateClassroomEvent,
    onSuccess: (_data, { classroomId }) => {
      invalidateClassroomSchedules(queryClient, classroomId);
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
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}

export const useClassroomSchedule = useTutorClassroomSchedule;
