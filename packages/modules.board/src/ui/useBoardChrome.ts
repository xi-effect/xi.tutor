import { createContext, useContext } from 'react';
import { resolveBoardChrome, type BoardChromeLayout } from '../utils/boardToolbarDock';

export const BoardChromeContext = createContext<BoardChromeLayout | null>(null);

export function useBoardChrome(): BoardChromeLayout {
  const layout = useContext(BoardChromeContext);
  if (layout) return layout;
  return resolveBoardChrome({ dock: 'bottom', toolbarVisible: true, wide: false });
}
