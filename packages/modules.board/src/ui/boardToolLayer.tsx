import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export const BoardToolLayerContext = createContext<HTMLElement | null>(null);

export const SetBoardToolLayerContext = createContext<(node: HTMLDivElement | null) => void>(
  () => {},
);

/** Слой тулбара вне z-0 канваса: выше звонка (z-20), ниже модалок (z-50). */
export function BoardToolLayer() {
  const setLayer = useContext(SetBoardToolLayerContext);

  return <div ref={setLayer} className="pointer-events-none absolute inset-0 z-30" />;
}

export function BoardToolPortal({ children }: { children: ReactNode }) {
  const layer = useContext(BoardToolLayerContext);

  if (!layer) return children;
  return createPortal(children, layer);
}

export function BoardToolLayerProvider({
  layer,
  setLayer,
  children,
}: {
  layer: HTMLElement | null;
  setLayer: (node: HTMLDivElement | null) => void;
  children: ReactNode;
}) {
  return (
    <SetBoardToolLayerContext.Provider value={setLayer}>
      <BoardToolLayerContext.Provider value={layer}>{children}</BoardToolLayerContext.Provider>
    </SetBoardToolLayerContext.Provider>
  );
}
