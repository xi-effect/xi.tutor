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
  requestFirstStepsTour,
  tourCompletionMarksStep,
  tourStopOpensAction,
  tourStopPath,
  writeFirstStepsTourIndex,
  FIRST_STEPS_CALL_COMPLETED_EVENT,
  useCompleteFirstStep,
  type FirstStepId,
  type FirstStepsTourSession,
  type FirstStepsTourStop,
} from 'common.services';

const WAIT_LIMIT = 40;
const CURSOR_MOVE_MS = 460;
const CURSOR_PRESS_MS = 180;

const CURSOR_SVG = `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M5 3.2 L5.4 21.2 L10.2 16.6 L14.3 24.2 L17.2 22.8 L13.1 15.2 L19.4 14.6 Z" fill="#fff" stroke="#161616" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

let tourClickTicket = 0;

const removeTourCursor = () => {
  document
    .querySelectorAll('.first-steps-tour-cursor, .first-steps-tour-click')
    .forEach((node) => node.remove());
};

/** Курсор доезжает до элемента. `press` добавляет нажатие. `false` — тур уже закрыт. */
const animateTourClick = (target: Element | undefined, press = true): Promise<boolean> => {
  const ticket = ++tourClickTicket;
  const alive = () => ticket === tourClickTicket;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!target || reduced) return Promise.resolve(alive());

  const rect = target.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return Promise.resolve(alive());

  removeTourCursor();
  const cursor = document.createElement('div');
  cursor.className = 'first-steps-tour-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = CURSOR_SVG;

  const from = document.querySelector('.driver-popover-next-btn')?.getBoundingClientRect();
  const tipX = 5;
  const tipY = 3;
  const startX = (from ? from.left + from.width / 2 : window.innerWidth - 120) - tipX;
  const startY = (from ? from.top + from.height / 2 : window.innerHeight - 80) - tipY;
  const endX = rect.left + rect.width / 2 - tipX;
  const endY = rect.top + rect.height / 2 - tipY;
  cursor.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
  document.body.appendChild(cursor);

  return new Promise((resolve) => {
    const pressCursor = () => {
      if (!alive()) {
        resolve(false);
        return;
      }
      cursor.classList.add('is-pressing');
      const ripple = document.createElement('span');
      ripple.className = 'first-steps-tour-click';
      ripple.style.left = `${rect.left + rect.width / 2}px`;
      ripple.style.top = `${rect.top + rect.height / 2}px`;
      document.body.appendChild(ripple);
      window.setTimeout(() => {
        ripple.remove();
        if (cursor.isConnected) cursor.remove();
        resolve(alive());
      }, CURSOR_PRESS_MS);
    };

    const onMoveEnd = (event: TransitionEvent) => {
      if (event.propertyName !== 'transform') return;
      cursor.removeEventListener('transitionend', onMoveEnd);
      window.clearTimeout(fallback);
      if (!press) {
        resolve(alive());
        return;
      }
      pressCursor();
    };
    cursor.addEventListener('transitionend', onMoveEnd);
    const fallback = window.setTimeout(() => {
      cursor.removeEventListener('transitionend', onMoveEnd);
      if (!press) {
        resolve(alive());
        return;
      }
      pressCursor();
    }, CURSOR_MOVE_MS + 240);

    requestAnimationFrame(() => {
      if (!alive()) return;
      cursor.style.transform = `translate3d(${endX}px, ${endY}px, 0)`;
    });
  });
};

const MENU_ANCHORS = new Set(['user-menu', 'settings-item', 'support-item', 'support-menu']);

const SUPPORT_FOCUS_ID = 'first-steps-support-focus';

const removeSupportFocus = () => {
  document.getElementById(SUPPORT_FOCUS_ID)?.remove();
};

/** Прямоугольник на пункт «Помощь» и открытое подменю, чтобы была видна связь. */
const placeSupportFocus = (): HTMLElement | null => {
  const help = findVisible('[data-first-step="help-item"]');
  const submenu = findVisible('[data-first-step="support-submenu"]');
  if (!help || !submenu) return null;

  const helpRect = help.getBoundingClientRect();
  const submenuRect = submenu.getBoundingClientRect();
  const pad = 8;
  const left = Math.min(helpRect.left, submenuRect.left) - pad;
  const top = Math.min(helpRect.top, submenuRect.top) - pad;
  const right = Math.max(helpRect.right, submenuRect.right) + pad;
  const bottom = Math.max(helpRect.bottom, submenuRect.bottom) + pad;

  let box = document.getElementById(SUPPORT_FOCUS_ID);
  if (!box) {
    box = document.createElement('div');
    box.id = SUPPORT_FOCUS_ID;
    box.setAttribute('aria-hidden', 'true');
    document.body.appendChild(box);
  }
  box.style.position = 'fixed';
  box.style.left = `${left}px`;
  box.style.top = `${top}px`;
  box.style.width = `${right - left}px`;
  box.style.height = `${bottom - top}px`;
  box.style.pointerEvents = 'none';
  return box;
};

const syncUserMenu = (anchor: string | undefined) => {
  if (anchor !== 'support-menu') removeSupportFocus();
  if (!anchor || !MENU_ANCHORS.has(anchor)) {
    window.dispatchEvent(new Event(FIRST_STEPS_CLOSE_USER_MENU_EVENT));
    return;
  }
  window.dispatchEvent(
    new CustomEvent(FIRST_STEPS_OPEN_USER_MENU_EVENT, {
      detail: { support: anchor === 'support-item' || anchor === 'support-menu' },
    }),
  );
};

const sidebarExpanded = () =>
  document.querySelector('#sidebar')?.getAttribute('data-sidebar-expanded') !== 'false';

const waitForTour = async (predicate: () => boolean): Promise<boolean> => {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    if (predicate()) return true;
    await new Promise((resolve) => window.setTimeout(resolve, 40));
  }
  return predicate();
};

/** Сворачивает панель настоящим кликом и тут же разворачивает её обратно. */
const performSidebarToggleDemo = async (): Promise<boolean> => {
  const clickToggle = async () => {
    const button = findVisible('#sidebar-toggle');
    if (!(button instanceof HTMLElement)) return false;
    const played = await animateTourClick(button);
    if (!played) return false;
    button.click();
    return true;
  };

  if (sidebarExpanded()) {
    if (!(await clickToggle())) return false;
    await waitForTour(() => !sidebarExpanded());
  }
  if (!(await clickToggle())) return false;
  await waitForTour(sidebarExpanded);
  return true;
};

/** Открывает меню профиля кликом по кнопке внизу панели. */
const performOpenUserMenu = async (): Promise<boolean> => {
  const button = findVisible('#hints-button');
  if (!(button instanceof HTMLElement)) return false;
  const played = await animateTourClick(button);
  if (!played) return false;

  const pointer = {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
  };
  button.dispatchEvent(new PointerEvent('pointerdown', pointer));
  button.dispatchEvent(new PointerEvent('pointerup', pointer));
  button.click();
  window.dispatchEvent(
    new CustomEvent(FIRST_STEPS_OPEN_USER_MENU_EVENT, { detail: { support: false } }),
  );
  return waitForTour(() => findVisible('[data-first-step="user-menu"]') != null);
};

/** Наводит курсор на «Помощь» и открывает подменю вместе с общей подсветкой. */
const performSupportHover = async (): Promise<boolean> => {
  const help = findVisible('[data-first-step="help-item"]');
  if (!(help instanceof HTMLElement)) return false;
  const played = await animateTourClick(help, false);
  if (!played) return false;
  window.dispatchEvent(
    new CustomEvent(FIRST_STEPS_OPEN_USER_MENU_EVENT, { detail: { support: true } }),
  );
  return waitForTour(() => placeSupportFocus() != null);
};

const demoCardSelector = (session: FirstStepsTourSession): string =>
  session.classroomId
    ? `[data-classroom-id="${session.classroomId}"]`
    : FIRST_STEPS_TOUR_SELECTORS['demo-classroom-card'];

const stopSelector = (stop: FirstStepsTourStop, session: FirstStepsTourSession): string =>
  stop.anchor === 'demo-classroom-card'
    ? demoCardSelector(session)
    : FIRST_STEPS_TOUR_SELECTORS[stop.anchor];

const navigatesOnClick = (stop: FirstStepsTourStop | undefined): boolean =>
  stop?.click === 'open-classrooms' || stop?.click === 'open-demo-classroom';

/** Курсор нажимает цель. Переход делает сам тур, чтобы анимация успела доиграть. */
const performAnimatedClick = async (selector: string): Promise<boolean> => {
  const target = findVisible(selector);
  const clickable = target?.querySelector('a') ?? target;
  if (!(clickable instanceof HTMLElement)) return false;
  return animateTourClick(clickable);
};

const stopDemo = (stop: FirstStepsTourStop | undefined): (() => Promise<boolean>) | null => {
  if (stop?.click === 'sidebar-toggle') return performSidebarToggleDemo;
  if (stop?.click === 'open-user-menu') return performOpenUserMenu;
  if (stop?.click === 'hover-support') return performSupportHover;
  return null;
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
  return findVisible(stopSelector(stop, session)) ? 'ready' : 'wait';
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
  if (path === '/classrooms') {
    void navigate({ to: '/classrooms' });
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
  const navigateRef = useRef(navigate);
  const translateRef = useRef(t);
  navigateRef.current = navigate;
  translateRef.current = t;

  useEffect(() => {
    const bump = () => setNonce((value) => value + 1);
    window.addEventListener(FIRST_STEPS_TOUR_EVENT, bump);
    return () => window.removeEventListener(FIRST_STEPS_TOUR_EVENT, bump);
  }, []);

  useEffect(() => {
    const onCallCompleted = () => setFinishedStep('call');
    window.addEventListener(FIRST_STEPS_CALL_COMPLETED_EVENT, onCallCompleted);
    return () => window.removeEventListener(FIRST_STEPS_CALL_COMPLETED_EVENT, onCallCompleted);
  }, []);

  useEffect(() => {
    const session = readFirstStepsTour();
    if (session?.callPhase !== 'board-hint' || !session.classroomId || !session.boardId) return;
    const boardPath = `/classrooms/${session.classroomId}/boards/${session.boardId}`;
    if (pathname !== boardPath && pathname !== `${boardPath}/`) clearFirstStepsTour();
  }, [pathname]);

  useEffect(() => {
    const session = readFirstStepsTour();
    if (!session || session.callPhase) return;

    const stops = FIRST_STEPS_TOUR_STOPS[session.step];
    let index = session.index;

    const sidebar = document.querySelector('#sidebar');
    const sidebarCollapsed =
      session.step === 'navigation' &&
      stops[index]?.click !== 'sidebar-toggle' &&
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
      if (path) goToPath(navigateRef.current, path);
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
    syncUserMenu(stops[index]?.anchor);
    if (stops[index]?.anchor === 'support-menu') placeSupportFocus();
    const group: FirstStepsTourStop[] = [];
    for (let cursor = index; cursor < stops.length; cursor += 1) {
      if (stopStatus(stops[cursor], session, pathname) !== 'ready') break;
      group.push(stops[cursor]);
    }

    const groupEnd = index + group.length;
    const tourContinues = groupEnd < stops.length;
    reasonRef.current = 'close';

    let clickPlaying = false;
    const runStop = (stop: FirstStepsTourStop | undefined, action: () => void) => {
      if (clickPlaying) return;
      const demo = navigatesOnClick(stop)
        ? () => performAnimatedClick(stopSelector(stop!, session))
        : stopDemo(stop);
      if (!demo) {
        action();
        return;
      }
      clickPlaying = true;
      void demo().then((shouldContinue) => {
        clickPlaying = false;
        if (shouldContinue) action();
      });
    };

    const moveNext: DriverHook = (_element, _step, { driver: tour }) => {
      const active = tour.getActiveIndex() ?? 0;
      runStop(group[active], () => {
        writeFirstStepsTourIndex(index + active + 1);
        tour.moveNext();
      });
    };
    const finishGroup: DriverHook = (_element, _step, { driver: tour }) => {
      const stop = group[group.length - 1];
      const complete = () => {
        if (tourContinues) {
          reasonRef.current = 'move';
          writeFirstStepsTourIndex(groupEnd);
          syncUserMenu(stops[groupEnd]?.anchor);
          tour.destroy();
          const nextPath = tourStopPath(stops[groupEnd], session);
          if (nextPath && !isOnTourPath(pathname, nextPath))
            goToPath(navigateRef.current, nextPath);
          else setNonce((value) => value + 1);
          return;
        }

        reasonRef.current = 'done';
        if (session.step === 'cabinet' && session.role === 'tutor' && session.classroomId != null) {
          reasonRef.current = 'move';
          setFinishedStep('cabinet');
          requestFirstStepsTour({
            step: 'call',
            role: session.role,
            userId: session.userId,
            classroomId: session.classroomId,
            boardId: session.boardId,
            noteId: session.noteId,
          });
          syncUserMenu(undefined);
          tour.destroy();
          return;
        }
        if (tourCompletionMarksStep(session.step)) setFinishedStep(session.step);
        if (stop && tourStopOpensAction(stop.anchor)) {
          window.dispatchEvent(
            new CustomEvent(FIRST_STEPS_TOUR_ACTION_EVENT, { detail: session.step }),
          );
        }
        clearFirstStepsTour();
        syncUserMenu(undefined);
        tour.destroy();
      };

      if (!tourContinues && tourCompletionMarksStep(session.step)) {
        setFinishedStep(session.step);
      }
      runStop(stop, complete);
    };

    const steps: DriveStep[] = group.map((stop, groupIndex) => {
      const lastInGroup = groupIndex === group.length - 1;
      return {
        element: findVisible(stopSelector(stop, session)) ?? undefined,
        popover: {
          title: translateRef.current(`firstStepsTour.${session.step}.${stop.anchor}.title`),
          description: translateRef.current(`firstStepsTour.${session.step}.${stop.anchor}.body`),
          side: stop.side ?? 'bottom',
          align: 'start' as const,
          ...(stop.click ? { nextBtnText: translateRef.current('onboarding.next') } : {}),
          progressText: translateRef
            .current('onboarding.progress')
            .replace('{{current}}', String(session.step === 'call' ? 1 : index + groupIndex + 1))
            .replace('{{total}}', String(session.step === 'call' ? 7 : stops.length)),
          ...(lastInGroup ? { onDoneClick: finishGroup } : { onNextClick: moveNext }),
        },
      };
    });

    const tour = driver({
      popoverClass: 'my-custom-popover-class',
      showProgress: true,
      popoverOffset: 16,
      steps,
      nextBtnText: translateRef.current('onboarding.next'),
      prevBtnText: translateRef.current('onboarding.prev'),
      doneBtnText:
        tourContinues ||
        (session.step === 'cabinet' && session.role === 'tutor' && session.classroomId != null)
          ? translateRef.current('onboarding.next')
          : translateRef.current('onboarding.done'),
      progressText: translateRef.current('onboarding.progress'),
      onDestroyed: () => {
        if (reasonRef.current === 'close') {
          clearFirstStepsTour();
          syncUserMenu(undefined);
        }
      },
    });

    const keepStepOnHighlightClick = (event: MouseEvent) => {
      if (!event.isTrusted) return;
      const activeElement = document.querySelector('.driver-active-element');
      if (
        !activeElement ||
        !(event.target instanceof Node) ||
        !activeElement.contains(event.target)
      ) {
        return;
      }
      const active = driverRef.current?.getActiveIndex() ?? 0;
      const stop = group[active];
      if (event.target instanceof Element && event.target.closest('[data-classroom-card-menu]')) {
        return;
      }
      writeFirstStepsTourIndex(index + active + (navigatesOnClick(stop) ? 1 : 0));
      if (stop?.click === 'sidebar-toggle') {
        window.setTimeout(() => setNonce((value) => value + 1), 280);
      }
    };
    document.addEventListener('click', keepStepOnHighlightClick, true);

    driverRef.current = tour;
    tour.drive();

    return () => {
      document.removeEventListener('click', keepStepOnHighlightClick, true);
      tourClickTicket += 1;
      removeTourCursor();
      reasonRef.current = 'move';
      tour.destroy();
      if (driverRef.current === tour) driverRef.current = null;
    };
  }, [nonce, pathname]);

  return null;
};
