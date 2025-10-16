import React, { useEffect, useState, useMemo } from 'react';
import '@livekit/components-styles';
import { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import {
  TrackLoop,
  useVisualStableUpdate,
  FocusLayoutProps,
  GridLayoutProps,
  useGridLayout,
  usePagination,
  useSwipe,
} from '@livekit/components-react';
import { useSearch } from '@tanstack/react-router';
import { useSize, useAdaptiveGrid } from '../../hooks';
import { ParticipantTile } from '../Participant';
import { SliderVideoGrid } from './SliderVideoGrid';
import { HorizontalFocusLayout } from './HorizontalFocusLayout';
import { VerticalFocusLayout } from './VerticalFocusLayout';
import { GridPaginationControls } from './GridPaginationControls';
import { SearchParams } from '../../types/router';
import { GRID_CONFIG, getGridLayoutsForScreen } from '../../config/grid';

export interface PaginationIndicatorProps {
  totalPageCount: number;
  currentPage: number;
}
export type OrientationLayoutT = {
  orientation: 'vertical' | 'horizontal' | 'grid';
};

export const EmptyItemContainerOfUser = ({ ...restProps }) => (
  <div
    {...restProps}
    className="bg-gray-40 flex w-full items-center justify-center rounded-[16px] text-center"
  >
    <p className="text-gray-0 font-sans text-3xl">Здесь пока никого нет</p>
  </div>
);

const useEmptyItemContainerOfUser = (tracksLength: number) => {
  const [isOneItem, setIsOneItem] = useState(tracksLength === 1);
  useEffect(() => {
    setIsOneItem(tracksLength === 1);
  }, [tracksLength]);
  return isOneItem;
};

export const FocusLayout = ({
  trackRef,
  orientation,
  ...htmlProps
}: FocusLayoutProps & OrientationLayoutT) => {
  const trackReference = trackRef;

  return (
    <div
      className={`${orientation === 'vertical' ? 'w-[calc(100%-277px)]' : 'm-auto w-fit min-w-[calc(100vh-20%)]'} flex flex-col`}
    >
      <ParticipantTile
        isFocusToggleDisable
        style={{
          width: '100%',
          height: '100%',
        }}
        {...trackReference}
        {...htmlProps}
      />
    </div>
  );
};

const { TILE } = GRID_CONFIG;

export type CarouselLayoutProps = React.HTMLAttributes<HTMLMediaElement> & {
  tracks: TrackReferenceOrPlaceholder[];
  children: React.ReactNode;
  orientation: 'vertical' | 'horizontal' | 'grid';
};

export const CarouselLayout = ({
  tracks,
  orientation,
  userTracks,
  ...props
}: CarouselLayoutProps & { userTracks: TrackReferenceOrPlaceholder[] }) => {
  const asideEl = React.useRef<HTMLDivElement>(null);
  const { width, height } = useSize(asideEl as React.RefObject<HTMLDivElement>);
  const carouselOrientation = orientation || (height >= width ? 'vertical' : 'horizontal');
  const tilesThatFit =
    carouselOrientation === 'vertical'
      ? Math.floor(+height / TILE.HEIGHT)
      : Math.floor(+width / TILE.WIDTH);

  const maxVisibleTiles = Math.floor(tilesThatFit);
  const sortedTiles = useVisualStableUpdate(tracks, maxVisibleTiles);
  const isOneItem = useEmptyItemContainerOfUser(userTracks.length);
  React.useLayoutEffect(() => {
    if (asideEl.current) {
      asideEl.current.dataset.lkOrientation = carouselOrientation;
      asideEl.current.style.setProperty('--lk-max-visible-tiles', maxVisibleTiles.toString());
    }
  }, [maxVisibleTiles, carouselOrientation]);

  return (
    <div
      ref={asideEl}
      className={`${carouselOrientation === 'horizontal' ? 'm-auto w-full' : 'mx-5 max-w-[277px]'}`}
    >
      {isOneItem && (
        <div className="h-[144px] w-[250px]">
          <EmptyItemContainerOfUser />
        </div>
      )}
      <SliderVideoGrid
        orientation={orientation}
        maxVisibleTiles={maxVisibleTiles}
        tracks={sortedTiles}
      >
        {props.children}
      </SliderVideoGrid>
    </div>
  );
};

export const PaginationIndicator = ({ totalPageCount, currentPage }: PaginationIndicatorProps) => {
  const bubbles = new Array(totalPageCount).fill('').map((_, index) => {
    if (index + 1 === currentPage) {
      return <span data-lk-active key={index} />;
    }
    return <span key={index} />;
  });

  return <div className="lk-pagination-indicator">{bubbles}</div>;
};

export const GridLayout = ({ tracks, ...props }: GridLayoutProps) => {
  const isOneItem = useEmptyItemContainerOfUser(tracks.length);
  const gridEl = React.createRef<HTMLDivElement>();

  // Используем адаптивную сетку с кастомными конфигурациями
  const { isMobile, isTablet, isDesktop, tileSize } = useAdaptiveGrid(
    gridEl as React.RefObject<HTMLDivElement>,
    tracks.length,
  );

  // Получаем кастомные конфигурации для текущего размера экрана
  const customGridLayouts = getGridLayoutsForScreen(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );

  const { layout: livekitLayout } = useGridLayout(
    gridEl as React.RefObject<HTMLDivElement>,
    tracks.length + (isOneItem ? 1 : 0),
    {
      gridLayouts: customGridLayouts,
    },
  );

  const pagination = usePagination(livekitLayout.maxTiles + (isOneItem ? 1 : 0), tracks);

  useSwipe(gridEl as React.RefObject<HTMLElement>, {
    onLeftSwipe: pagination.nextPage,
    onRightSwipe: pagination.prevPage,
  });

  // Установка CSS переменных для динамической сетки с адаптивностью
  React.useEffect(() => {
    if (gridEl.current && livekitLayout) {
      gridEl.current.style.setProperty('--lk-col-count', livekitLayout.columns.toString());
      gridEl.current.style.setProperty('--lk-row-count', livekitLayout.rows.toString());

      // Устанавливаем кастомные переменные для адаптивности
      gridEl.current.style.setProperty('--lk-tile-size', `${tileSize.width}px`);
      gridEl.current.style.setProperty('--lk-aspect-ratio', '1');

      // Переменные для разных устройств
      gridEl.current.style.setProperty(
        '--lk-device-type',
        isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      );
    }
  }, [livekitLayout, gridEl, tileSize, isMobile, isTablet, isDesktop]);

  return (
    <div className="m-auto w-full" style={{ height: 'var(--available-height)' }}>
      <div
        ref={gridEl}
        style={
          {
            gap: '1rem',
            maxWidth: '100%',
            margin: '0 auto',
            '--lk-tile-width': `${tileSize.width}px`,
            '--lk-tile-height': `${tileSize.height}px`,
          } as React.CSSProperties
        }
        data-lk-pagination={pagination.totalPageCount + (isOneItem ? 1 : 0) > 1}
        data-lk-device-type={isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}
        className="lk-grid-layout adaptive-grid"
      >
        <TrackLoop tracks={pagination.tracks}>{props.children}</TrackLoop>
        {isOneItem && <EmptyItemContainerOfUser />}

        {/* Новые элементы управления пагинацией для grid режима */}
        {tracks.length > livekitLayout.maxTiles && (
          <GridPaginationControls
            canPrev={pagination.currentPage > 1}
            canNext={pagination.currentPage < pagination.totalPageCount}
            onPrev={pagination.prevPage}
            onNext={pagination.nextPage}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPageCount}
          />
        )}
      </div>
    </div>
  );
};

type CarouselContainerProps = {
  focusTrack: TrackReferenceOrPlaceholder | undefined;
  carouselTracks: TrackReferenceOrPlaceholder[];
};

export const CarouselContainer = ({ focusTrack, carouselTracks }: CarouselContainerProps) => {
  const search: SearchParams = useSearch({ strict: false });

  // Получаем ориентацию из URL параметров
  const carouselType = search.carouselType || 'horizontal';
  const orientation = carouselType === 'vertical' ? 'vertical' : 'horizontal';

  // Создаем фокусный элемент
  const focusElement = useMemo(() => {
    if (!focusTrack) return null;

    return (
      <ParticipantTile
        isFocusToggleDisable
        style={{
          width: '100%',
          height: '100%',
        }}
        className="h-full w-full [&_video]:object-contain lg:[&_video]:object-cover"
        {...focusTrack}
      />
    );
  }, [focusTrack]);

  // Создаем превью элементы для карусели
  const thumbElements = useMemo(() => {
    return carouselTracks.map((track) => (
      <ParticipantTile
        key={`${track.participant.identity}-${track.source}`}
        style={{ flex: 'unset' }}
        className="h-full w-full [&_video]:object-cover"
        {...track}
      />
    ));
  }, [carouselTracks]);

  // Выбираем правильный layout в зависимости от ориентации
  if (orientation === 'vertical') {
    return <VerticalFocusLayout focus={focusElement} thumbs={thumbElements} />;
  }

  return <HorizontalFocusLayout focus={focusElement} thumbs={thumbElements} />;
};
