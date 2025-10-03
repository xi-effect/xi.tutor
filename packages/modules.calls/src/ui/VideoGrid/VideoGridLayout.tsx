import React, { useEffect, useState } from 'react';
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
import { useSize } from '../../hooks';
import { ParticipantTile } from '../Participant';
import { SliderVideoGrid } from './SliderVideoGrid';
import { SearchParams } from '../../types/router';
import { GRID_CONFIG } from '../../config/grid';

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

  const { layout } = useGridLayout(
    gridEl as React.RefObject<HTMLDivElement>,
    tracks.length + (isOneItem ? 1 : 0),
  );
  const pagination = usePagination(layout.maxTiles + (isOneItem ? 1 : 0), tracks);

  useSwipe(gridEl as React.RefObject<HTMLElement>, {
    onLeftSwipe: pagination.nextPage,
    onRightSwipe: pagination.prevPage,
  });

  // Установка CSS переменных для динамической сетки
  React.useEffect(() => {
    if (gridEl.current && layout) {
      gridEl.current.style.setProperty('--lk-col-count', layout.columns.toString());
      gridEl.current.style.setProperty('--lk-row-count', layout.rows.toString());
    }
  }, [layout, gridEl]);

  return (
    <div className="m-auto w-full" style={{ height: 'var(--available-height)' }}>
      <div
        ref={gridEl}
        style={{ gap: '1rem', maxWidth: '100%', margin: '0 auto' }}
        data-lk-pagination={pagination.totalPageCount + (isOneItem ? 1 : 0) > 1}
        className="lk-grid-layout"
      >
        <TrackLoop tracks={pagination.tracks}>{props.children}</TrackLoop>
        {isOneItem && <EmptyItemContainerOfUser />}
        {tracks.length > layout.maxTiles && (
          <PaginationIndicator
            totalPageCount={pagination.totalPageCount}
            currentPage={pagination.currentPage}
          />
        )}
      </div>
    </div>
  );
};

type CarouselContainerProps = {
  focusTrack: TrackReferenceOrPlaceholder | undefined;
  tracks: TrackReferenceOrPlaceholder[];
  carouselTracks: TrackReferenceOrPlaceholder[];
};

export const CarouselContainer = ({
  focusTrack,
  tracks,
  carouselTracks,
}: CarouselContainerProps) => {
  const search: SearchParams = useSearch({ strict: false });
  const [orientation, setCarouselType] = useState<'horizontal' | 'vertical'>('horizontal');

  useEffect(() => {
    setCarouselType(search.carouselType || 'horizontal');
  }, [search.carouselType]);

  return (
    <div
      className={`flex h-full ${orientation === 'horizontal' ? 'flex-col' : ''} items-start justify-between gap-4`}
    >
      {orientation === 'vertical' ? (
        <>
          {focusTrack && <FocusLayout orientation={orientation} trackRef={focusTrack} />}
          <CarouselLayout orientation={orientation} userTracks={tracks} tracks={carouselTracks}>
            <ParticipantTile style={{ flex: 'unset' }} className="h-[144px] w-[250px]" />
          </CarouselLayout>
        </>
      ) : (
        <>
          <CarouselLayout orientation={orientation} userTracks={tracks} tracks={carouselTracks}>
            <ParticipantTile style={{ flex: 'unset' }} className="h-[144px] w-[250px]" />
          </CarouselLayout>
          {focusTrack && <FocusLayout orientation={orientation} trackRef={focusTrack} />}
        </>
      )}
    </div>
  );
};
