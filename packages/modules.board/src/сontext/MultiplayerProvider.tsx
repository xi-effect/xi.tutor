/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { createTLStore, type TLStore } from 'tldraw';
import { useHocuspocusRoom } from '../hooks/useHocuspocusRoom';
import { useTldrawDiffSync } from '../hooks/useTldrawDiffSync';
import { useTldrawPresence } from '../hooks/useTldrawPresence';
import type { Editor } from 'tldraw';
import * as Y from 'yjs';
import type { HocuspocusProvider } from '@hocuspocus/provider';

interface Ctx {
  store: TLStore;
  editor: Editor | null; // появится после монтирования <Tldraw>
  doc: Y.Doc;
  provider: HocuspocusProvider;
}

const MultiplayerCtx = createContext<Ctx | null>(null);

export const useMultiplayer = () => {
  const ctx = useContext(MultiplayerCtx);
  if (!ctx) throw new Error('useMultiplayer must be used inside <MultiplayerProvider>');
  return ctx;
};

interface Props {
  url: string;
  roomId: string;
  username?: string;
  children: ReactNode;
}

export function MultiplayerProvider({ url, roomId, username, children }: Props) {
  const store = useMemo(() => createTLStore(), []) as TLStore;
  const { doc, provider } = useHocuspocusRoom({ url, roomId });

  // включаем мультиплеер‑хуки
  useTldrawDiffSync(store, doc);
  // @ts-expect-error
  useTldrawPresence(store, provider.awareness, username);

  const value = useMemo<Ctx>(
    () => ({ store, editor: null, doc, provider }),
    [store, doc, provider],
  );
  return <MultiplayerCtx.Provider value={value}>{children}</MultiplayerCtx.Provider>;
}
