import { useState, useEffect, useCallback } from 'react';
import {
  GRID_CONFIG,
  type GridBreakpoint,
  getGridLayoutsForScreen,
  getOptimalGridLayout,
} from '../config/grid';

/**
 * Улучшенный хук для адаптивных настроек сетки с поддержкой кастомных gridLayouts
 */
export const useResponsiveGrid = () => {
  const [breakpoint, setBreakpoint] = useState<GridBreakpoint>('lg');
  const [maxTiles, setMaxTiles] = useState<number>(GRID_CONFIG.MAX_TILES_PER_PAGE.lg);
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setScreenWidth(width);

      if (width < GRID_CONFIG.BREAKPOINTS.sm) {
        setBreakpoint('xs');
        setMaxTiles(GRID_CONFIG.MAX_TILES_PER_PAGE.xs);
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < GRID_CONFIG.BREAKPOINTS.md) {
        setBreakpoint('sm');
        setMaxTiles(GRID_CONFIG.MAX_TILES_PER_PAGE.sm);
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < GRID_CONFIG.BREAKPOINTS.lg) {
        setBreakpoint('md');
        setMaxTiles(GRID_CONFIG.MAX_TILES_PER_PAGE.md);
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else if (width < GRID_CONFIG.BREAKPOINTS.xl) {
        setBreakpoint('lg');
        setMaxTiles(GRID_CONFIG.MAX_TILES_PER_PAGE.lg);
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      } else if (width < GRID_CONFIG.BREAKPOINTS['2xl']) {
        setBreakpoint('xl');
        setMaxTiles(GRID_CONFIG.MAX_TILES_PER_PAGE.xl);
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      } else {
        setBreakpoint('2xl');
        setMaxTiles(GRID_CONFIG.MAX_TILES_PER_PAGE['2xl']);
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  // Получение подходящих конфигураций для текущего размера экрана
  const getLayoutsForCurrentScreen = useCallback(() => {
    return getGridLayoutsForScreen(screenWidth);
  }, [screenWidth]);

  // Получение оптимальной конфигурации для конкретного количества участников
  const getOptimalLayout = useCallback(
    (participantCount: number) => {
      return getOptimalGridLayout(participantCount, screenWidth);
    },
    [screenWidth],
  );

  return {
    breakpoint,
    maxTiles,
    screenWidth,
    isMobile,
    isTablet,
    isDesktop,
    getLayoutsForCurrentScreen,
    getOptimalLayout,
  };
};

/**
 * Хук для управления адаптивной сеткой с кастомными конфигурациями
 */
export const useAdaptiveGrid = (
  gridRef: React.RefObject<HTMLDivElement>,
  participantCount: number,
) => {
  const {
    screenWidth,
    isMobile,
    isTablet,
    isDesktop,
    getLayoutsForCurrentScreen,
    getOptimalLayout,
  } = useResponsiveGrid();

  // Получение оптимальной конфигурации
  const optimalLayout = getOptimalLayout(participantCount);
  const availableLayouts = getLayoutsForCurrentScreen();

  // Вычисление размера плитки для соотношения сторон 1:1
  const calculateTileSize = useCallback(() => {
    if (!gridRef.current || !optimalLayout) {
      return { width: 200, height: 200 };
    }

    const containerRect = gridRef.current.getBoundingClientRect();
    const gap = 16; // Отступ между плитками
    const availableWidth = containerRect.width - (optimalLayout.columns - 1) * gap;
    const availableHeight = containerRect.height - (optimalLayout.rows - 1) * gap;

    const tileWidth = Math.max(
      GRID_CONFIG.TILE.MIN_WIDTH,
      Math.min(GRID_CONFIG.TILE.WIDTH, availableWidth / optimalLayout.columns),
    );
    const tileHeight = Math.max(
      GRID_CONFIG.TILE.MIN_HEIGHT,
      Math.min(GRID_CONFIG.TILE.HEIGHT, availableHeight / optimalLayout.rows),
    );

    // Обеспечиваем соотношение сторон 1:1
    const size = Math.min(tileWidth, tileHeight);

    return { width: size, height: size };
  }, [optimalLayout, gridRef]);

  const tileSize = calculateTileSize();
  const needsPagination = participantCount > (optimalLayout?.maxTiles || 16);

  return {
    layout: optimalLayout,
    screenWidth,
    isMobile,
    isTablet,
    isDesktop,
    needsPagination,
    tileSize,
    availableLayouts,
  };
};
