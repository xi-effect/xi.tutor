/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type DropHandler = (tokenId: string) => void;

type TokenDndContextValue = {
  pickedId: string | null;
  draggedId: string | null;
  pick: (id: string | null) => void;
  beginDrag: (id: string, clientX: number, clientY: number) => void;
  registerDrop: (zoneId: string, handler: DropHandler) => () => void;
};

const TokenDndContext = createContext<TokenDndContextValue | null>(null);

function dropZoneFromPoint(clientX: number, clientY: number, draggedId: string): string | null {
  const hits = document.elementsFromPoint(clientX, clientY);
  for (const hit of hits) {
    const node = hit as HTMLElement;
    if (
      node.closest?.('[data-activity-token]')?.getAttribute('data-activity-token') === draggedId
    ) {
      continue;
    }
    const zone = node.closest?.('[data-activity-drop-zone]') as HTMLElement | null;
    const zoneId = zone?.dataset.activityDropZone;
    if (zoneId) return zoneId;
  }
  return null;
}

export function TokenDndProvider({ children }: { children: ReactNode }) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const draggedIdRef = useRef<string | null>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const dropsRef = useRef(new Map<string, DropHandler>());

  const pick = useCallback((id: string | null) => {
    setPickedId((current) => (id != null && current === id ? null : id));
  }, []);

  const beginDrag = useCallback((id: string, clientX: number, clientY: number) => {
    draggedIdRef.current = id;
    originRef.current = { x: clientX, y: clientY };
    setDraggedId(id);
  }, []);

  const registerDrop = useCallback((zoneId: string, handler: DropHandler) => {
    dropsRef.current.set(zoneId, handler);
    return () => {
      dropsRef.current.delete(zoneId);
    };
  }, []);

  useEffect(() => {
    if (!draggedId) return;

    const finish = (event: PointerEvent) => {
      const tokenId = draggedIdRef.current;
      draggedIdRef.current = null;
      setDraggedId(null);
      if (!tokenId) return;

      const zoneId = dropZoneFromPoint(event.clientX, event.clientY, tokenId);
      if (zoneId) {
        dropsRef.current.get(zoneId)?.(tokenId);
        setPickedId(null);
        return;
      }

      const dx = event.clientX - originRef.current.x;
      const dy = event.clientY - originRef.current.y;
      if (dx * dx + dy * dy < 36) {
        pick(tokenId);
      }
    };

    const cancel = () => {
      draggedIdRef.current = null;
      setDraggedId(null);
    };

    window.addEventListener('pointerup', finish, true);
    window.addEventListener('pointercancel', cancel, true);
    return () => {
      window.removeEventListener('pointerup', finish, true);
      window.removeEventListener('pointercancel', cancel, true);
    };
  }, [draggedId, pick]);

  const value = useMemo(
    () => ({
      pickedId,
      draggedId,
      pick,
      beginDrag,
      registerDrop,
    }),
    [beginDrag, draggedId, pick, pickedId, registerDrop],
  );

  return (
    <TokenDndContext.Provider value={value}>
      <div className="h-full min-h-0">{children}</div>
    </TokenDndContext.Provider>
  );
}

const idleTokenDnd: TokenDndContextValue = {
  pickedId: null,
  draggedId: null,
  pick: (id: string | null) => {
    void id;
  },
  beginDrag: (id: string, clientX: number, clientY: number) => {
    void id;
    void clientX;
    void clientY;
  },
  registerDrop: () => () => undefined,
};

export function useTokenDnd() {
  return useContext(TokenDndContext) ?? idleTokenDnd;
}
