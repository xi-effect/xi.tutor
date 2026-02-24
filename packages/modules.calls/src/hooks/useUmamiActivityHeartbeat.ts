import { useLocation } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useCallStore } from '../store/callStore';

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 минут

/** Проверяет, находится ли пользователь на странице доски по pathname */
function isBoardPath(pathname: string): boolean {
  return (
    /^\/board\/[^/]+$/.test(pathname) ||
    /\/classrooms\/[^/]+\/boards\/[^/]+/.test(pathname) ||
    /\/materials\/[^/]+\/board\/?$/.test(pathname)
  );
}

/**
 * Раз в 5 минут вызывает umami.track(), если пользователь
 * в активной ВКС или на странице доски.
 */
export function useUmamiActivityHeartbeat() {
  const pathname = useLocation().pathname;
  const isStarted = useCallStore((s) => s.isStarted);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOnBoard = isBoardPath(pathname);
  const shouldTrack = Boolean(isStarted || isOnBoard);

  useEffect(() => {
    if (!shouldTrack) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const track = () => {
      const win = window as Window & { umami?: { track: (name?: string) => void } };
      if (typeof window !== 'undefined' && win.umami) {
        win.umami.track();
      }
    };

    intervalRef.current = setInterval(track, HEARTBEAT_INTERVAL_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldTrack]);

  return null;
}
