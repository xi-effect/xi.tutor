import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStartCall as useStartCallBase } from '@xipkg/calls-hooks';
import { useCallsNavigation } from '@xipkg/calls-providers';
import type { StartCallDataT } from '@xipkg/calls-types';
import { ClassroomsQueryKey, type ClassroomTutorResponseSchema } from 'common.api';
import { useCurrentUser } from 'common.services';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getProductAnalyticsRole,
  inferProductAnalyticsSourceFromPathname,
  trackProductEvent,
  type ProductAnalyticsLessonType,
  type ProductAnalyticsSource,
} from 'common.utils';

type StartCallOptions = {
  source?: ProductAnalyticsSource;
};

const resolveLessonType = (kind?: string): ProductAnalyticsLessonType => {
  if (kind === 'individual') return 'individual';
  if (kind === 'group') return 'group';
  return 'unknown';
};

const readLessonTypeFromCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  classroomId: string,
): ProductAnalyticsLessonType => {
  const classroom = queryClient.getQueryData<ClassroomTutorResponseSchema>([
    ClassroomsQueryKey.GetClassroom,
    Number(classroomId),
  ]);

  return resolveLessonType(classroom?.kind);
};

export const useStartCall = () => {
  const { startCall: startCallBase, isLoading, error } = useStartCallBase();
  const { data: user } = useCurrentUser();
  const navigation = useCallsNavigation();
  const queryClient = useQueryClient();

  const startCall = useCallback(
    async (data: StartCallDataT, options?: StartCallOptions) => {
      const role = getProductAnalyticsRole(user?.default_layout);
      const source =
        options?.source ?? inferProductAnalyticsSourceFromPathname(navigation.pathname);
      const lessonType = readLessonTypeFromCache(queryClient, data.classroom_id);

      await startCallBase(data);

      if (role === 'tutor') {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.LESSON_STARTED, {
          role: 'tutor',
          source,
          lesson_type: lessonType,
        });
        return;
      }

      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.LESSON_JOINED, {
        role,
        source,
        lesson_type: lessonType,
      });
    },
    [navigation.pathname, queryClient, startCallBase, user?.default_layout],
  );

  return { startCall, isLoading, error };
};
