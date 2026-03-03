import { useEffect, useMemo, useState } from 'react';
import {
  BOARD_BOTTOM_TOOLBAR_PX,
  BOARD_TOP_TOOLBAR_PX,
  BOTTOM_OFFSET_DEFAULT_PX,
  COMPACT_BOTTOM_BAR_PX,
  HEADER_HEIGHT_PX,
  TILES_PADDING_PX,
} from '../ui/CompactView/constants';

function calcAvailableHeight(isOnBoardPage: boolean): number {
  if (typeof window === 'undefined') return 400;
  if (isOnBoardPage) {
    return (
      window.innerHeight -
      HEADER_HEIGHT_PX -
      BOARD_TOP_TOOLBAR_PX -
      BOARD_BOTTOM_TOOLBAR_PX -
      COMPACT_BOTTOM_BAR_PX -
      TILES_PADDING_PX
    );
  }
  return (
    window.innerHeight -
    HEADER_HEIGHT_PX -
    BOTTOM_OFFSET_DEFAULT_PX -
    COMPACT_BOTTOM_BAR_PX -
    TILES_PADDING_PX
  );
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
