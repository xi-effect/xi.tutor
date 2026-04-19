import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  schedulerApiConfig,
  SchedulerQueryKey,
  type CreateClassroomEventRequestDto,
  type UpdateClassroomEventRequestDto,
  type GetClassroomScheduleResponseDto,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError } from '../../utils';
import { mapScheduleResponseToScheduleItems } from './adapters';
import type { ScheduleItem } from './types';

// ---------------------------------------------------------------------------
// Query keys factory
// ---------------------------------------------------------------------------

export const schedulerQueryKeys = {
  classroomSchedule: (classroomId: number, happensAfter: string, happensBefore: string) =>
    ['classroom-schedule', classroomId, happensAfter, happensBefore] as const,

  /** Для инвалидации всего расписания кабинета без привязки к диапазону */
  allForClassroom: (classroomId: number) => ['classroom-schedule', classroomId] as const,
} as const;

// ---------------------------------------------------------------------------
// useClassroomSchedule
// ---------------------------------------------------------------------------

export interface UseClassroomScheduleParams {
  classroomId: number;
  happensAfter: string;
  happensBefore: string;
  enabled?: boolean;
}

export function useClassroomSchedule({
  classroomId,
  happensAfter,
  happensBefore,
  enabled = true,
}: UseClassroomScheduleParams) {
  return useQuery<ScheduleItem[]>({
    queryKey: schedulerQueryKeys.classroomSchedule(classroomId, happensAfter, happensBefore),
    queryFn: async () => {
      const axiosInst = await getAxiosInstance();
      const response = await axiosInst<GetClassroomScheduleResponseDto>({
        method: schedulerApiConfig[SchedulerQueryKey.GetClassroomSchedule].method,
        url: schedulerApiConfig[SchedulerQueryKey.GetClassroomSchedule].getUrl(
          classroomId.toString(),
        ),
        params: {
          happens_after: happensAfter,
          happens_before: happensBefore,
        },
      });
      return mapScheduleResponseToScheduleItems(response.data);
    },
    enabled: enabled && classroomId > 0,
  });
}

// ---------------------------------------------------------------------------
// useCreateClassroomEvent
// ---------------------------------------------------------------------------

export interface CreateClassroomEventParams {
  classroomId: number;
  body: CreateClassroomEventRequestDto;
}

export function useCreateClassroomEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateClassroomEventParams>({
    mutationFn: async ({ classroomId, body }) => {
      const axiosInst = await getAxiosInstance();
      await axiosInst({
        method: schedulerApiConfig[SchedulerQueryKey.CreateClassroomEvent].method,
        url: schedulerApiConfig[SchedulerQueryKey.CreateClassroomEvent].getUrl(
          classroomId.toString(),
        ),
        data: body,
      });
    },
    onSuccess: (_data, { classroomId }) => {
      queryClient.invalidateQueries({
        queryKey: schedulerQueryKeys.allForClassroom(classroomId),
      });
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}

// ---------------------------------------------------------------------------
// useUpdateClassroomEvent
// ---------------------------------------------------------------------------

export interface UpdateClassroomEventParams {
  classroomId: number;
  eventId: number;
  body: UpdateClassroomEventRequestDto;
}

export function useUpdateClassroomEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateClassroomEventParams>({
    mutationFn: async ({ classroomId, eventId, body }) => {
      const axiosInst = await getAxiosInstance();
      await axiosInst({
        method: schedulerApiConfig[SchedulerQueryKey.UpdateClassroomEvent].method,
        url: schedulerApiConfig[SchedulerQueryKey.UpdateClassroomEvent].getUrl(
          classroomId.toString(),
          eventId.toString(),
        ),
        data: body,
      });
    },
    onSuccess: (_data, { classroomId }) => {
      queryClient.invalidateQueries({
        queryKey: schedulerQueryKeys.allForClassroom(classroomId),
      });
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}

// ---------------------------------------------------------------------------
// useDeleteClassroomEvent
// ---------------------------------------------------------------------------

export interface DeleteClassroomEventParams {
  classroomId: number;
  eventId: number;
}

export function useDeleteClassroomEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteClassroomEventParams>({
    mutationFn: async ({ classroomId, eventId }) => {
      const axiosInst = await getAxiosInstance();
      await axiosInst({
        method: schedulerApiConfig[SchedulerQueryKey.DeleteClassroomEvent].method,
        url: schedulerApiConfig[SchedulerQueryKey.DeleteClassroomEvent].getUrl(
          classroomId.toString(),
          eventId.toString(),
        ),
      });
    },
    onSuccess: (_data, { classroomId }) => {
      queryClient.invalidateQueries({
        queryKey: schedulerQueryKeys.allForClassroom(classroomId),
      });
    },
    onError: (err) => {
      handleError(err, 'scheduler');
    },
  });
}
