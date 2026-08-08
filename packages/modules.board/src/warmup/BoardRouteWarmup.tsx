import { env } from 'common.env';
import { useEffect, useRef } from 'react';
import { prefetchBoardModule } from './prefetchBoardModule';
import {
  ensureResourceHint,
  scheduleIdleTask,
  shouldSkipBackgroundPrefetch,
  toHttpOrigin,
} from './utils';

/** Фоновый прогрев доски на страницах, откуда чаще всего открывают доску (кабинет, материалы). */
export const BoardRouteWarmup = () => {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || shouldSkipBackgroundPrefetch()) return;

    ensureResourceHint('preconnect', toHttpOrigin(env.VITE_SERVER_URL_HOCUS), true);
    ensureResourceHint('dns-prefetch', env.VITE_SERVER_URL_BACKEND);

    const cancel = scheduleIdleTask(() => {
      startedRef.current = true;
      void prefetchBoardModule().catch(() => {
        startedRef.current = false;
      });
    }, 3000);

    return cancel;
  }, []);

  return null;
};
