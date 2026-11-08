import { useLocation, useNavigate } from '@tanstack/react-router';
import { driver, type DriveStep, type Driver, type DriverHook } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../utils/driver.css';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FIRST_STEPS_CLOSE_USER_MENU_EVENT,
  FIRST_STEPS_EXPAND_SIDEBAR_EVENT,
  FIRST_STEPS_OPEN_USER_MENU_EVENT,
  FIRST_STEPS_TOUR_ACTION_EVENT,
  FIRST_STEPS_TOUR_EVENT,
  FIRST_STEPS_TOUR_SELECTORS,
  FIRST_STEPS_TOUR_STOPS,
  clearFirstStepsTour,
  isOnTourPath,
  readFirstStepsTour,
  tourCompletionMarksStep,
  tourStopOpensAction,
  tourStopPath,
  writeFirstStepsTourIndex,
  useCompleteFirstStep,
  type FirstStepId,
  type FirstStepsTourSession,
  type FirstStepsTourStop,
} from 'common.services';

const WAIT_LIMIT = 40;

const MENU_ANCHORS = new Set(['user-menu', 'settings-item', 'support-item']);

const syncUserMenu = (anchor: string | undefined) => {
  if (!anchor || !MENU_ANCHORS.has(anchor)) {
    window.dispatchEvent(new Event(FIRST_STEPS_CLOSE_USER_MENU_EVENT));
    return;
  }
  window.dispatchEvent(
    new CustomEvent(FIRST_STEPS_OPEN_USER_MENU_EVENT, {
      detail: { support: anchor === 'support-item' },
    }),
  );
};

const findVisible = (selector: string): Element | null => {
  const nodes = document.querySelectorAll(selector);
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return node;
  }
  return null;
};

type StopStatus = 'ready' | 'navigate' | 'wait' | 'skip';

const stopStatus = (
  stop: FirstStepsTourStop,
  session: FirstStepsTourSession,
  pathname: string,
): StopStatus => {
  const path = tourStopPath(stop, session);
  if (stop.place !== 'current' && path == null) return 'skip';
  if (!isOnTourPath(pathname, path)) return 'navigate';
  return findVisible(FIRST_STEPS_TOUR_SELECTORS[stop.anchor]) ? 'ready' : 'wait';
};

const goToPath = (navigate: ReturnType<typeof useNavigate>, path: string) => {
  if (path === '/') {
    void navigate({ to: '/' });
    return;
  }
  if (path === '/schedule') {
    void navigate({ to: '/schedule' });
    return;
  }
  if (path === '/settings/appearance') {
    void navigate({
      to: '/settings/$section',
      params: { section: 'appearance' },
      search: { call: undefined, period: undefined },
    });
    return;
  }

  const classroom = path.match(/^\/classrooms\/([^/]+)$/);
  if (classroom) {
    void navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId: classroom[1] },
    });
    return;
  }

  const board = path.match(/^\/classrooms\/([^/]+)\/boards\/([^/]+)$/);
  if (board) {
    void navigate({
      to: '/classrooms/$classroomId/boards/$boardId',
      params: { classroomId: board[1], boardId: board[2] },
    });
    return;
  }

  const note = path.match(/^\/classrooms\/([^/]+)\/notes\/([^/]+)$/);
  if (note) {
    void navigate({
      to: '/classrooms/$classroomId/notes/$noteId',
      params: { classroomId: note[1], noteId: note[2] },
    });
  }
};

export const FirstStepsTourHost = () => {
  const { t } = useTranslation('commonUi');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [nonce, setNonce] = useState(0);
  const [finishedStep, setFinishedStep] = useState<FirstStepId | null>(null);
  useCompleteFirstStep(finishedStep ?? 'cabinet', finishedStep != null);

  const driverRef = useRef<Driver | null>(null);
  const reasonRef = useRef<'close' | 'move' | 'done'>('close');
  const waitsRef = useRef(0);

  useEffect(() => {
    const bump = () => setNonce((value) => value + 1);
    window.addEventListener(FIRST_STEPS_TOUR_EVENT, bump);
    return () => window.removeEventListener(FIRST_STEPS_TOUR_EVENT, bump);
  }, []);

  useEffect(() => {
    const session = readFirstStepsTour();
    if (!session) return;

    const stops = FIRST_STEPS_TOUR_STOPS[session.step];
    let index = session.index;

    const sidebar = document.querySelector('#sidebar');
    const sidebarCollapsed =
      session.step === 'navigation' &&
      sidebar?.getAttribute('data-sidebar-expanded') === 'false' &&
      document.querySelector('#home-menu-item') != null;
    if (sidebarCollapsed) {
      window.dispatchEvent(new Event(FIRST_STEPS_EXPAND_SIDEBAR_EVENT));
      if (waitsRef.current < WAIT_LIMIT) {
        const timer = window.setTimeout(() => {
          waitsRef.current += 1;
          setNonce((value) => value + 1);
        }, 200);
        return () => window.clearTimeout(timer);
      }
      waitsRef.current = 0;
    }

    while (index < stops.length && stopStatus(stops[index], session, pathname) === 'skip') {
      index += 1;
    }

    if (index !== session.index) writeFirstStepsTourIndex(index);

    if (index >= stops.length) {
      clearFirstStepsTour();
      return;
    }

    const status = stopStatus(stops[index], session, pathname);
    if (status === 'navigate') {
      const path = tourStopPath(stops[index], session);
      if (path) goToPath(navigate, path);
      return;
    }

    if (status === 'wait') {
      syncUserMenu(stops[index].anchor);
      if (waitsRef.current >= WAIT_LIMIT) {
        waitsRef.current = 0;
        writeFirstStepsTourIndex(index + 1);
        setNonce((value) => value + 1);
        return;
      }
      const timer = window.setTimeout(() => {
        waitsRef.current += 1;
        setNonce((value) => value + 1);
      }, 200);
      return () => window.clearTimeout(timer);
    }

    waitsRef.current = 0;
    const group: FirstStepsTourStop[] = [];
    for (let cursor = index; cursor < stops.length; cursor += 1) {
      if (stopStatus(stops[cursor], session, pathname) !== 'ready') break;
      group.push(stops[cursor]);
    }

    const groupEnd = index + group.length;
    const tourContinues = groupEnd < stops.length;
    reasonRef.current = 'close';

    const moveNext: DriverHook = (_element, _step, { driver: tour }) => {
      tour.moveNext();
    };
    const finishGroup: DriverHook = (_element, _step, { driver: tour }) => {
      const stop = group[group.length - 1];
      if (tourContinues) {
        reasonRef.current = 'move';
        writeFirstStepsTourIndex(groupEnd);
        syncUserMenu(stops[groupEnd]?.anchor);
        tour.destroy();
        const nextPath = tourStopPath(stops[groupEnd], session);
        if (nextPath && !isOnTourPath(pathname, nextPath)) goToPath(navigate, nextPath);
        else setNonce((value) => value + 1);
        return;
      }

      reasonRef.current = 'done';
      if (stop && tourStopOpensAction(stop.anchor)) {
        window.dispatchEvent(
          new CustomEvent(FIRST_STEPS_TOUR_ACTION_EVENT, { detail: session.step }),
        );
      }
      if (tourCompletionMarksStep(session.step)) setFinishedStep(session.step);
      clearFirstStepsTour();
      syncUserMenu(undefined);
      tour.destroy();
    };

    const steps: DriveStep[] = group.map((stop, groupIndex) => {
      const lastInGroup = groupIndex === group.length - 1;
      return {
        element: findVisible(FIRST_STEPS_TOUR_SELECTORS[stop.anchor]) ?? undefined,
        popover: {
          title: t(`firstStepsTour.${session.step}.${stop.anchor}.title`),
          description: t(`firstStepsTour.${session.step}.${stop.anchor}.body`),
          side: stop.side ?? 'bottom',
          align: 'start' as const,
          ...(lastInGroup ? { onDoneClick: finishGroup } : { onNextClick: moveNext }),
        },
      };
    });

    const tour = driver({
      popoverClass: 'my-custom-popover-class',
      showProgress: true,
      popoverOffset: 16,
      disableActiveInteraction: session.step === 'settings' || session.step === 'navigation',
      steps,
      nextBtnText: t('onboarding.next'),
      prevBtnText: t('onboarding.prev'),
      doneBtnText: tourContinues ? t('onboarding.next') : t('onboarding.done'),
      progressText: t('onboarding.progress'),
      onDestroyed: () => {
        if (reasonRef.current === 'close') {
          clearFirstStepsTour();
          syncUserMenu(undefined);
        }
      },
    });

    driverRef.current = tour;
    tour.drive();

    return () => {
      reasonRef.current = 'move';
      tour.destroy();
      if (driverRef.current === tour) driverRef.current = null;
    };
  }, [navigate, nonce, pathname, t]);

  return null;
};
