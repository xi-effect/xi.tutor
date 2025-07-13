import { useEditor } from '@tldraw/editor';
import { MultiplayerProvider, useMultiplayer } from '../сontext/MultiplayerProvider';
import { TldrawCanvas } from './components/canvas';
import { useEffect } from 'react';
import { useTldrawPresence } from '../hooks/useTldrawPresence';

/* -------- мост presence, уже внутри контекста Tldraw -------- */
function PresenceBridge({ username }: { username?: string }) {
  const { store, provider } = useMultiplayer();
  const editor = useEditor();
  useTldrawPresence(store, editor, provider.awareness, username);
  return null;
}

/* -------- оболочка Tldraw, берёт store из контекста -------- */
function InnerTldraw() {
  const { store } = useMultiplayer();
  return (
    <TldrawCanvas store={store} autoFocus>
      <PresenceBridge username={'test'} />
    </TldrawCanvas>
  );
}

export const TldrawBoard = () => {
  useEffect(() => {
    const removeWatermark = () => {
      document.querySelectorAll('.tl-watermark_SEE-LICENSE').forEach((el) => el.remove());
    };

    // Удалить сразу после загрузки
    removeWatermark();

    // И повторять, если tldraw вдруг пересоздаст watermark
    const observer = new MutationObserver(removeWatermark);
    observer.observe(document.body, { childList: true, subtree: true });

    // Очистка
    return () => observer.disconnect();
  }, []);

  return (
    <MultiplayerProvider url={'wss://hocus.xieffect.ru'} roomId={'roomid'} username={'test'}>
      <InnerTldraw />
    </MultiplayerProvider>
  );
};
