import { useEffect, useMemo, useState } from 'react';
import {
  BOTTOM_OFFSET_DEFAULT_PX,
  COMPACT_BOTTOM_OFFSET_BOARD_PX,
  HEADER_HEIGHT_PX,
} from '../ui/CompactView/constants';

/**
 * Максимальная высота, доступная для всего контейнера compact call
 * (видеообласть + нижняя панель). Соответствует CSS-позиционированию
 * top-16 / bottom-[72px] | bottom-4 в CompactView.
 */
function calcAvailableHeight(isOnBoardPage: boolean): number {
  if (typeof window === 'undefined') return 400;
  const bottomOffset = isOnBoardPage
    ? COMPACT_BOTTOM_OFFSET_BOARD_PX // 72, matches bottom-[72px]
    : BOTTOM_OFFSET_DEFAULT_PX; // 16, matches bottom-4
  return window.innerHeight - HEADER_HEIGHT_PX - bottomOffset;
}

export function useCompactAvailableHeight(isOnBoardPage: boolean): number {
  const initialHeight = useMemo(() => calcAvailableHeight(isOnBoardPage), [isOnBoardPage]);
  const [availableHeight, setAvailableHeight] = useState(initialHeight);

  useEffect(() => {
    setAvailableHeight(initialHeight);
    const onResize = () => setAvailableHeight(calcAvailableHeight(isOnBoardPage));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isOnBoardPage, initialHeight]);

  return availableHeight;
}
