import { useMediaQuery } from '@xipkg/utils';

/** Совпадает с нижней навигацией приложения. */
export const useBoardIsMobile = () => useMediaQuery('(max-width: 960px)');
