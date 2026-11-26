import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import type { CallsNavigationT, UseCallsNavigationHookT } from '@xipkg/calls-providers';
import { isElectronConferenceSurface } from 'common.platform';
import { asClassroomId, firstClassroomId } from './classroomId';

export const useTanstackCallsNavigation: UseCallsNavigationHookT = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false }) as {
    callId?: string;
    classroomId?: string;
    boardId?: string;
    noteId?: string;
  };
  const search = useSearch({ strict: false }) as Record<string, unknown>;

  const classroomIdFromPage = useCallback(
    () => firstClassroomId(params.classroomId, params.callId, search.call),
    [params.callId, params.classroomId, search.call],
  );

  const getCallId = useCallback(
    () => firstClassroomId(params.callId, search.call),
    [params.callId, search.call],
  );

  const navigationSearch = useMemo(() => {
    const call = asClassroomId(search.call);
    const next = { ...(search as Record<string, string | undefined>) };
    if (call) next.call = call;
    else delete next.call;
    return next;
  }, [search]);

  const navigation = useMemo<CallsNavigationT>(
    () => ({
      pathname: location.pathname,
      search: navigationSearch,
      params,
      getCallId,
      navigateToCall: (classroomId, options) => {
        if (isElectronConferenceSurface()) return;
        const callId = firstClassroomId(classroomId, classroomIdFromPage());
        if (!callId) return;
        navigate({
          to: '/call/$callId',
          params: { callId },
          search: { call: callId },
          replace: options?.replace,
        });
      },
      navigateToClassroom: (classroomId) => {
        if (isElectronConferenceSurface()) return;
        const id = asClassroomId(classroomId);
        if (!id) return;
        navigate({
          to: '/classrooms/$classroomId',
          params: { classroomId: id },
          search: { call: id },
        });
      },
      navigateToClassroomOverview: (classroomId, options) => {
        if (isElectronConferenceSurface()) return;
        const id = asClassroomId(classroomId);
        if (!id) return;
        const search: Record<string, string | undefined> = { tab: 'boards' };
        if (options?.backgroundCall) {
          search.call = id;
        }
        navigate({
          to: '/classrooms/$classroomId',
          params: { classroomId: id },
          search,
        });
      },
      navigateToClassroomBoard: (classroomId, boardId, options) => {
        if (isElectronConferenceSurface()) return;
        const id = firstClassroomId(classroomId, classroomIdFromPage());
        if (!id || !boardId) return;
        const alreadyOnBoard = params.classroomId === id && params.boardId === boardId;
        navigate({
          to: '/classrooms/$classroomId/boards/$boardId',
          params: { classroomId: id, boardId },
          search: alreadyOnBoard ? { call: id, board_nav: String(Date.now()) } : { call: id },
          replace: options?.replace,
        });
      },
      navigateToClassroomNote: (classroomId, noteId, options) => {
        if (isElectronConferenceSurface()) return;
        const id = firstClassroomId(classroomId, classroomIdFromPage());
        if (!id || !noteId) return;
        const alreadyOnNote = params.classroomId === id && params.noteId === noteId;
        navigate({
          to: '/classrooms/$classroomId/notes/$noteId',
          params: { classroomId: id, noteId },
          search: alreadyOnNote ? { call: id, board_nav: String(Date.now()) } : { call: id },
          replace: options?.replace,
        });
      },
      navigateToBoard: (boardId, options) => {
        if (isElectronConferenceSurface()) return;
        if (!boardId) return;
        // Без кабинета `/board/$boardId` читает личный материал. У ученика его нет — 404.
        const classroomId = firstClassroomId(options?.search?.call, classroomIdFromPage());
        if (classroomId) {
          const alreadyOnBoard = params.classroomId === classroomId && params.boardId === boardId;
          navigate({
            to: '/classrooms/$classroomId/boards/$boardId',
            params: { classroomId, boardId },
            search: alreadyOnBoard
              ? { call: classroomId, board_nav: String(Date.now()) }
              : { call: classroomId },
            replace: options?.replace,
          });
          return;
        }
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
        if (!navigationSearch.call) return;
        const searchWithoutCall = { ...navigationSearch };
        delete searchWithoutCall.call;
        navigate({
          to: location.pathname,
          search: searchWithoutCall,
          replace: true,
        });
      },
      pathnameIncludes: (segment) => location.pathname.includes(segment),
      isOnClassroomOverviewWithActiveCall: () => {
        const tab = navigationSearch.tab;
        const call = navigationSearch.call;
        return (
          /^\/classrooms\/[^/]+\/?$/.test(location.pathname) &&
          (tab === 'boards' || tab === 'overview' || !tab) &&
          !!call
        );
      },
      isOnOtherPageWithCompactCall: () =>
        !location.pathname.includes('/call/') && !!navigationSearch.call,
    }),
    [classroomIdFromPage, getCallId, location.pathname, navigate, navigationSearch, params],
  );

  return navigation;
};
