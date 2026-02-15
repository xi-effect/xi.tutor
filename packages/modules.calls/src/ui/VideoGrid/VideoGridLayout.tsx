import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TrackReferenceOrPlaceholder, isEqualTrackRef } from '@livekit/components-core';
import { Track } from 'livekit-client';
import { TrackLoop, FocusLayoutProps, GridLayoutProps } from '@livekit/components-react';
import { ParticipantTile } from '../Participant';
import { HorizontalFocusLayout } from './HorizontalFocusLayout';
import { VerticalFocusLayout } from './VerticalFocusLayout';
import { useCallStore } from '../../store/callStore';
export type OrientationLayoutT = {
  orientation: 'vertical' | 'horizontal' | 'grid';
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

const ASPECT = 16 / 9;

type MeetLayout = {
  cols: number;
  tileW: number;
  tileH: number;
};

function calcMeetLayout(
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

export const GridLayout = ({ tracks, ...props }: GridLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const count = tracks.length;

  useMeetLayout(containerRef as React.RefObject<HTMLElement>, count, 8);

  const gridStyle = useMemo<React.CSSProperties>(
    () => ({
      gridTemplateColumns: 'repeat(var(--meet-cols), var(--meet-tile-w))',
      gap: 'var(--meet-gap)',
    }),
    [],
  );

  return (
    <div
      ref={containerRef}
      className="grid h-full w-full min-w-0 place-content-center overflow-hidden"
      style={{ ...gridStyle, maxHeight: 'var(--available-height)' }}
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
  const carouselType = useCallStore((state) => state.carouselType);
  const orientation = carouselType === 'vertical' ? 'vertical' : 'horizontal';

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

  if (orientation === 'vertical') {
    return <VerticalFocusLayout focus={focusElement} thumbs={thumbElements} />;
  }

  return <HorizontalFocusLayout focus={focusElement} thumbs={thumbElements} />;
};
