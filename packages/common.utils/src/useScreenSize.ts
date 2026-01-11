import { useMedia } from './useMedia';
import type { ScreenSizeT } from 'common.types';

export const useScreenSize = (): ScreenSizeT => {
  const isMobile = useMedia('(max-width: 720px)');
  const isTablet = useMedia('(max-width: 960px)');

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
};
