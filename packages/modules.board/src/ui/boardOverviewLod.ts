import type { Editor } from '@ibodr/draw';
import { useEffect, useState } from 'react';

/** Совпадает с `lodZoom` в редакторе: ниже этого зума стикер рисуется плашкой. */
export const BOARD_OVERVIEW_ZOOM = 0.6;

let overview = false;
const listeners = new Set<() => void>();

function setBoardOverviewLod(next: boolean) {
  if (overview === next) return;
  overview = next;
  for (const listener of listeners) listener();
}

/** Один слушатель на редактор, а не подписка каждого стикера на зум. */
export function useBoardOverviewLod() {
  const [value, setValue] = useState(overview);
  useEffect(() => {
    const listener = () => setValue(overview);
    listeners.add(listener);
    setValue(overview);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return value;
}

export function bindBoardOverviewLod(editor: Editor) {
  const update = () => setBoardOverviewLod(editor.getZoomLevel() < BOARD_OVERVIEW_ZOOM);
  update();
  return editor.store.listen(update, { scope: 'session' });
}
