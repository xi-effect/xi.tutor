import { useCallback, useMemo, type ReactNode } from 'react';
import { useEditor } from '@ibodr/draw';
import {
  ActivityCanvasContext,
  ActivitySessionContext,
  type ActivitySession,
} from './activityHostContext';

export function ActivityCanvasProvider({
  markEventAsHandled,
  children,
}: {
  markEventAsHandled: (event: Event) => void;
  children: ReactNode;
}) {
  return (
    <ActivityCanvasContext.Provider value={markEventAsHandled}>
      {children}
    </ActivityCanvasContext.Provider>
  );
}

export function BoardActivityCanvas({ children }: { children: ReactNode }) {
  const editor = useEditor();
  const markEventAsHandled = useCallback(
    (event: Event) => {
      editor.markEventAsHandled(event);
    },
    [editor],
  );

  return (
    <ActivityCanvasProvider markEventAsHandled={markEventAsHandled}>
      {children}
    </ActivityCanvasProvider>
  );
}

export function ActivitySessionProvider({
  token,
  children,
}: {
  token: string;
  children: ReactNode;
}) {
  const value = useMemo<ActivitySession>(() => ({ token }), [token]);
  return (
    <ActivitySessionContext.Provider value={value}>{children}</ActivitySessionContext.Provider>
  );
}
