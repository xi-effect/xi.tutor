import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';

export function useHocuspocusRoom({ url, roomId }: { url: string; roomId: string }) {
  /* ---------- persist Doc ---------- */
  const docRef = useRef<Y.Doc | null>(null);
  if (!docRef.current) docRef.current = new Y.Doc();

  /* ---------- persist Provider ---------- */
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const prevKeyRef = useRef<string>(`${url}|${roomId}`);

  if (!providerRef.current || prevKeyRef.current !== `${url}|${roomId}`) {
    providerRef.current?.destroy(); // закрываем старый
    const p = new HocuspocusProvider({
      url,
      name: roomId,
      token: roomId,
      document: docRef.current,
    });
    attachLogs(p);
    providerRef.current = p;
    prevKeyRef.current = `${url}|${roomId}`;
  }

  /* ---------- финальный cleanup ---------- */
  useEffect(() => {
    const provider = providerRef.current!;
    const doc = docRef.current!;
    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, []);

  return { doc: docRef.current!, provider: providerRef.current! };
}

function attachLogs(p: HocuspocusProvider) {
  p.on('open', () => console.log('[hp] socket open'));
  p.on('connected', () => console.log('[hp] connected'));
  p.on('close', ({ code }: { code: number }) => console.log('[hp] closed', code));
  p.on('error', (e: unknown) => console.error('[hp] error', e));
}
