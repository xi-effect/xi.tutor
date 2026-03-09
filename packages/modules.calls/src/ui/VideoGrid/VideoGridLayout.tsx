import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TrackReferenceOrPlaceholder, isEqualTrackRef } from '@livekit/components-core';
import { Track } from 'livekit-client';
import { TrackLoop, GridLayoutProps } from '@livekit/components-react';
import { ParticipantTile } from '../Participant';
import { FocusLayout } from './FocusLayout';
import { PagedCarousel } from './PagedCarousel';
import { useSize } from '../../hooks/useSize';

const ASPECT = 16 / 9;

type MeetLayout = {
  cols: number;
  tileW: number;
  tileH: number;
};

export function calcMeetLayout(
  containerW: number,
  containerH: number,
  count: number,
  gap: number,
): MeetLayout {
  if (count <= 0 || containerW <= 0 || containerH <= 0) {
    return { cols: 1, tileW: 0, tileH: 0 };
  }

  let best: MeetLayout = { cols: 1, tileW: 0, tileH: 0 };
  let bestArea = 0;

  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);

    const maxWByCols = (containerW - gap * (cols - 1)) / cols;
    const maxHByRows = (containerH - gap * (rows - 1)) / rows;

    if (maxWByCols <= 0 || maxHByRows <= 0) continue;

    const tileW = Math.min(maxWByCols, maxHByRows * ASPECT);
    const tileH = tileW / ASPECT;

    const area = tileW * tileH;
    if (area > bestArea) {
      bestArea = area;
      best = { cols, tileW, tileH };
    }
  }

  return {
    cols: Math.max(1, best.cols),
    tileW: Math.max(0, Math.floor(best.tileW)),
    tileH: Math.max(0, Math.floor(best.tileH)),
  };
}

function useMeetLayout(ref: React.RefObject<HTMLElement>, count: number, gap: number) {
  const [layout, setLayout] = useState<MeetLayout>({ cols: 1, tileW: 0, tileH: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const next = calcMeetLayout(rect.width, rect.height, count, gap);
      setLayout(next);

      // Устанавливаем CSS переменные
      el.style.setProperty('--meet-cols', String(next.cols));
      el.style.setProperty('--meet-tile-w', `${next.tileW}px`);
      el.style.setProperty('--meet-gap', `${gap}px`);
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => ro.disconnect();
  }, [ref, count, gap]);

  return layout;
}

const MOBILE_BREAKPOINT = 640;

export const GridLayout = ({ tracks, ...props }: GridLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef as React.RefObject<HTMLDivElement>);
  const count = tracks.length;
  const isMobile = containerSize.width > 0 && containerSize.width < MOBILE_BREAKPOINT;

  useMeetLayout(containerRef as React.RefObject<HTMLElement>, count, 8);

  const mobileTiles = useMemo(() => {
    if (!isMobile) return [];
    return tracks.map((track) => (
      <ParticipantTile
        key={`${track.participant.identity}-${track.source}`}
        isFocusToggleDisable
        style={{ width: '100%', height: '100%' }}
        className="h-full w-full"
        {...track}
      />
    ));
  }, [isMobile, tracks]);

  if (isMobile) {
    return (
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ maxHeight: 'var(--available-height)' }}
      >
        <PagedCarousel
          items={mobileTiles}
          orientation="vertical"
          aspectRatio={16 / 9}
          minItemSize={120}
          maxItemSize={200}
          renderItem={(node) => (
            <div className="relative h-full w-full">
              <div className="absolute inset-0">{node}</div>
            </div>
          )}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="grid h-full w-full min-w-0 place-content-center overflow-hidden"
      style={{
        gridTemplateColumns: 'repeat(var(--meet-cols), var(--meet-tile-w))',
        gap: 'var(--meet-gap)',
        maxHeight: 'var(--available-height)',
      }}
    >
      <TrackLoop tracks={tracks}>{props.children}</TrackLoop>
    </div>
  );
};

type CarouselContainerProps = {
  focusTrack: TrackReferenceOrPlaceholder | undefined;
  carouselTracks: TrackReferenceOrPlaceholder[];
};

export const CarouselContainer = ({ focusTrack, carouselTracks }: CarouselContainerProps) => {
  const focusElement = useMemo(() => {
    const trackToFocus =
      focusTrack ||
      carouselTracks.find((track) => track.publication?.source === Track.Source.Camera);

    if (!trackToFocus) {
      return (
        <div className="bg-gray-40 flex h-full w-full items-center justify-center rounded-2xl">
          <span className="text-lg text-gray-100">Нет участников для отображения</span>
        </div>
      );
    }

    return (
      <ParticipantTile
        isFocusToggleDisable
        isFocusView
        style={{
          width: '100%',
          height: '100%',
        }}
        className="h-full w-full"
        {...trackToFocus}
      />
    );
  }, [focusTrack, carouselTracks]);

  const thumbElements = useMemo(() => {
    const trackToFocus =
      focusTrack ||
      carouselTracks.find((track) => track.publication?.source === Track.Source.Camera);
    const filteredCarouselTracks = trackToFocus
      ? carouselTracks.filter((track) => !isEqualTrackRef(track, trackToFocus))
      : carouselTracks;

    return filteredCarouselTracks.map((track) => (
      <ParticipantTile
        key={`${track.participant.identity}-${track.source}`}
        style={{ flex: 'unset' }}
        className="h-full w-full [&_video]:object-cover"
        {...track}
      />
    ));
  }, [carouselTracks, focusTrack]);

  return <FocusLayout focus={focusElement} thumbs={thumbElements} />;
};
