import { createContext, useCallback, useContext, type SyntheticEvent } from 'react';

type MarkEvent = (event: Event) => void;

export const ActivityCanvasContext = createContext<MarkEvent | null>(null);

/** На доске помечает жест как обработанный, чтобы холст его не перехватывал. */
export function useActivityEventGuard() {
  const mark = useContext(ActivityCanvasContext);

  const stop = useCallback(
    (event: SyntheticEvent) => {
      mark?.(event.nativeEvent);
      event.stopPropagation();
    },
    [mark],
  );

  const markNative = useCallback(
    (event: Event) => {
      mark?.(event);
    },
    [mark],
  );

  return { stop, markNative };
}

export type ActivitySession = {
  token: string;
};

export const ActivitySessionContext = createContext<ActivitySession | null>(null);

export function useActivitySession() {
  const session = useContext(ActivitySessionContext);
  if (!session) {
    throw new Error('useActivitySession must be used within ActivitySessionProvider');
  }
  return session;
}
