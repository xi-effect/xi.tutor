import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassroomResponseT } from '../types';
import {
  ClassroomsQueryKey,
  InvitationsQueryKey,
  NotificationsQueryKey,
  studentApiConfig,
  StudentQueryKey,
  StudentsQueryKey,
  UserQueryKey,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useCurrentUser, useUpdateProfile } from 'common.services';
import {
  PRODUCT_ANALYTICS_EVENTS,
  clearPendingInviteCode,
  createAttemptId,
  getInviteTrackingId,
  getInviteFunnelEventProps,
  getProductAnalyticsRole,
  mapInviteAcceptError,
  measureDurationMs,
  nowMs,
  trackProductEvent,
  type ProductAnalyticsInviteKind,
} from 'common.utils';
import { hasConfirmedClassroom } from './invitePageLogic';

type AcceptInviteVariables = {
  code: string;
  invite_kind: ProductAnalyticsInviteKind;
};

type AcceptInviteContext = {
  attemptId: string;
  startedAt: number;
};

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  return useMutation<ClassroomResponseT, Error, AcceptInviteVariables, AcceptInviteContext>({
    mutationFn: async ({ code }) => {
      const axiosInst = await getAxiosInstance();
      const response = await axiosInst({
        method: studentApiConfig[StudentQueryKey.UseInvitation].method,
        url: studentApiConfig[StudentQueryKey.UseInvitation].getUrl(code),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const classroomData = response.data as ClassroomResponseT;
      if (!hasConfirmedClassroom(classroomData)) {
        throw new Error('classroom_not_confirmed');
      }
      return classroomData;
    },
    onMutate: (variables) => {
      const attemptId = createAttemptId();
      const startedAt = nowMs();
      const studentAuthenticated = Boolean(currentUser?.id);

      void getInviteTrackingId(variables.code).then((invite_tracking_id) => {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_ACCEPT_SUBMIT, {
          attempt_id: attemptId,
          student_authenticated: studentAuthenticated,
          invite_flow_version: 2,
          invite_tracking_id,
          ...getInviteFunnelEventProps(studentAuthenticated),
        });
      });

      return { attemptId, startedAt };
    },
    onSuccess: (_classroomData, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.GetClassrooms] });
      queryClient.invalidateQueries({ queryKey: [StudentQueryKey.Classrooms] });
      queryClient.invalidateQueries({ queryKey: [StudentsQueryKey.AllStudents] });
      queryClient.invalidateQueries({ queryKey: [StudentQueryKey.Tutors] });
      queryClient.invalidateQueries({ queryKey: [InvitationsQueryKey.AllInvitations] });
      queryClient.invalidateQueries({ queryKey: [NotificationsQueryKey.SearchNotifications] });
      queryClient.invalidateQueries({ queryKey: [NotificationsQueryKey.GetUnreadCount] });

      const user = queryClient.getQueryData<typeof currentUser>([UserQueryKey.Home]) || currentUser;

      void getInviteTrackingId(variables.code).then((invite_tracking_id) => {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.INVITE_ACCEPTED_SUCCESS, {
          role: getProductAnalyticsRole(user?.default_layout),
          invite_kind: variables.invite_kind,
          attempt_id: context?.attemptId,
          student_authenticated: Boolean(user?.id),
          invite_flow_version: 2,
          invite_tracking_id,
          classroom_created: true,
          ...getInviteFunnelEventProps(Boolean(user?.id)),
        });
      });

      clearPendingInviteCode();

      if (user?.default_layout === 'tutor') {
        updateProfile.mutate({ default_layout: 'student' });
      }
    },
    onError: (error, variables, context) => {
      if (!context) return;

      void getInviteTrackingId(variables.code).then((invite_tracking_id) => {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_ACCEPT_FAILED, {
          attempt_id: context.attemptId,
          student_authenticated: Boolean(currentUser?.id),
          reason: mapInviteAcceptError(error),
          duration_ms: measureDurationMs(context.startedAt),
          invite_flow_version: 2,
          invite_tracking_id,
          ...getInviteFunnelEventProps(Boolean(currentUser?.id)),
        });
      });
    },
  });
};
