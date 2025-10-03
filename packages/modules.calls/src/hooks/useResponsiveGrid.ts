import { useState, useEffect } from 'react';
import { GRID_CONFIG, type GridBreakpoint } from '../config/grid';

/**
 * Хук для определения адаптивных настроек сетки
 */
export const useResponsiveGrid = () => {
  const [breakpoint, setBreakpoint] = useState<GridBreakpoint>('lg');
  const [maxTiles, setMaxTiles] = useState<number>(GRID_CONFIG.MAX_TILES_PER_PAGE.lg);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width < GRID_CONFIG.BREAKPOINTS.sm) {
        setBreakpoint('xs');
        setMaxTiles(GRID_CONFIG.MAX_TILES_PER_PAGE.xs);
      } else if (width < GRID_CONFIG.BREAKPOINTS.md) {
        setBreakpoint('sm');
        setMaxTiles(GRID_CONFIG.MAX_TILES_PER_PAGE.sm);
      } else if (width < GRID_CONFIG.BREAKPOINTS.lg) {
        setBreakpoint('md');
        setMaxTiles(GRID_CONFIG.MAX_TILES_PER_PAGE.md);
      } else if (width < GRID_CONFIG.BREAKPOINTS.xl) {
        setBreakpoint('lg');
        setMaxTiles(GRID_CONFIG.MAX_TILES_PER_PAGE.lg);
      } else if (width < GRID_CONFIG.BREAKPOINTS['2xl']) {
        setBreakpoint('xl');
        setMaxTiles(GRID_CONFIG.MAX_TILES_PER_PAGE.xl);
      } else {
        setBreakpoint('2xl');
        setMaxTiles(GRID_CONFIG.MAX_TILES_PER_PAGE['2xl']);
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    maxTiles,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
  };
};
