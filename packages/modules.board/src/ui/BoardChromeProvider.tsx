import { useMediaQuery } from '@xipkg/utils';
import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { useBoardPreferencesStore } from '../store';
import {
  BOARD_CHROME_BOTTOM_VAR,
  BOARD_CHROME_LEFT_VAR,
  BOARD_CHROME_RIGHT_VAR,
  BOARD_CHROME_TOP_VAR,
  BOARD_TOAST_BOTTOM_VAR,
  BOARD_TOAST_RIGHT_VAR,
  BOARD_TOOLBAR_DOCK_ATTR,
  BOARD_TOOLBAR_DOCK_MEDIA,
  resolveBoardChrome,
  resolveEffectiveToolbarDock,
  type BoardChromeLayout,
} from '../utils/boardToolbarDock';
import { startLegacyCompactChromeSync } from './legacyCompactChrome';
import { BoardChromeContext } from './useBoardChrome';
import { BoardToolLayerProvider } from './boardToolLayer';

function publishBoardChrome(layout: BoardChromeLayout) {
  const root = document.documentElement;
  root.style.setProperty(BOARD_CHROME_TOP_VAR, `${layout.insets.top}px`);
  root.style.setProperty(BOARD_CHROME_RIGHT_VAR, `${layout.insets.right}px`);
  root.style.setProperty(BOARD_CHROME_BOTTOM_VAR, `${layout.insets.bottom}px`);
  root.style.setProperty(BOARD_CHROME_LEFT_VAR, `${layout.insets.left}px`);
  root.style.setProperty(BOARD_TOAST_BOTTOM_VAR, `${layout.toastBottom}px`);
  root.style.setProperty(BOARD_TOAST_RIGHT_VAR, `${layout.toastRight}px`);
  root.setAttribute(BOARD_TOOLBAR_DOCK_ATTR, layout.dock);
}

function clearBoardChrome() {
  const root = document.documentElement;
  for (const name of [
    BOARD_CHROME_TOP_VAR,
    BOARD_CHROME_RIGHT_VAR,
    BOARD_CHROME_BOTTOM_VAR,
    BOARD_CHROME_LEFT_VAR,
    BOARD_TOAST_BOTTOM_VAR,
    BOARD_TOAST_RIGHT_VAR,
  ]) {
    root.style.removeProperty(name);
  }
  root.removeAttribute(BOARD_TOOLBAR_DOCK_ATTR);
}

export function BoardChromeProvider({
  toolbarVisible,
  children,
}: {
  toolbarVisible: boolean;
  children: ReactNode;
}) {
  const storedDock = useBoardPreferencesStore((state) => state.toolbarDock);
  const wide = useMediaQuery(BOARD_TOOLBAR_DOCK_MEDIA);
  const dock = resolveEffectiveToolbarDock(storedDock, wide);
  const layout = useMemo(
    () => resolveBoardChrome({ dock, toolbarVisible, wide }),
    [dock, toolbarVisible, wide],
  );

  const [toolLayer, setToolLayer] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    publishBoardChrome(layout);
    const stopLegacySync = startLegacyCompactChromeSync(layout.insets);
    return () => {
      stopLegacySync();
      clearBoardChrome();
    };
  }, [layout]);

  return (
    <BoardChromeContext.Provider value={layout}>
      <BoardToolLayerProvider layer={toolLayer} setLayer={setToolLayer}>
        {children}
      </BoardToolLayerProvider>
    </BoardChromeContext.Provider>
  );
}
