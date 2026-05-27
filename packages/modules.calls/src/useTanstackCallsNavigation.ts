import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import type { CallsNavigationT, UseCallsNavigationHookT } from '@xipkg/calls-providers';

export const useTanstackCallsNavigation: UseCallsNavigationHookT = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false }) as {
    callId?: string;
    classroomId?: string;
    boardId?: string;
  };
  const search = useSearch({ strict: false }) as Record<string, string | undefined>;

  const getCallId = useCallback(() => params.callId ?? search.call, [params.callId, search.call]);

  const navigation = useMemo<CallsNavigationT>(
    () => ({
      pathname: location.pathname,
      search,
      params,
      getCallId,
      navigateToCall: (classroomId, options) => {
        navigate({
          to: '/call/$callId',
          params: { callId: classroomId },
          search: { call: classroomId },
          replace: options?.replace,
        });
      },
      navigateToClassroom: (classroomId) => {
        navigate({
          to: '/classrooms/$classroomId',
          params: { classroomId },
          search: { call: classroomId },
        });
      },
      navigateToClassroomOverview: (classroomId) => {
        navigate({
          to: '/classrooms/$classroomId',
          params: { classroomId },
          search: { tab: 'overview', call: classroomId },
        });
      },
      navigateToClassroomBoard: (classroomId, boardId, options) => {
        navigate({
          to: '/classrooms/$classroomId/boards/$boardId',
          params: { classroomId, boardId },
          search: { call: classroomId },
          replace: options?.replace,
        });
      },
      navigateToBoard: (boardId, options) => {
        navigate({
          to: '/board/$boardId',
          params: { boardId },
          search: options?.search,
          replace: options?.replace,
        });
      },
      replaceSearch: (nextSearch) => {
        navigate({
          to: location.pathname,
          search: nextSearch,
          replace: true,
        });
      },
      clearCallSearchParam: () => {
        if (!search.call) return;
        const searchWithoutCall = { ...search };
        delete searchWithoutCall.call;
        navigate({
          to: location.pathname,
          search: searchWithoutCall,
          replace: true,
        });
      },
      pathnameIncludes: (segment) => location.pathname.includes(segment),
      isOnClassroomOverviewWithActiveCall: () => {
        const tab = search.tab;
        const call = search.call;
        return (
          /^\/classrooms\/[^/]+$/.test(location.pathname) && (tab === 'overview' || !tab) && !!call
        );
      },
      isOnOtherPageWithCompactCall: () => !location.pathname.includes('/call/') && !!search.call,
    }),
    [getCallId, location.pathname, navigate, params, search],
  );

  return navigation;
};
