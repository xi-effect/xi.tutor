import React from 'react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { isEqualTrackRef, isTrackReference, isWeb, log } from '@livekit/components-core';
import { RoomEvent, Track } from 'livekit-client';
import {
  LayoutContextProvider,
  RoomAudioRenderer,
  VideoConferenceProps,
  useCreateLayoutContext,
  usePinnedTracks,
  useTracks,
} from '@livekit/components-react';
import { ParticipantTile } from '../Participant';
import { calcMeetLayout, CarouselContainer, GridLayout } from './VideoGridLayout';
import { useCallStore } from '../../store/callStore';
import { useScreenShareCleanup } from '../../hooks/useScreenShareCleanup';
import { useSortedTracks } from '../../hooks/useSortedTracks';
import { useSize } from '../../hooks';
import '../../styles/grid.css';

const GRID_GAP = 8;

function useFirstPageSize(
  containerSize: { width: number; height: number },
  layoutMode: 'grid' | 'horizontal' | 'vertical',
  trackCount: number,
): number {
  return React.useMemo(() => {
    if (!containerSize.width || !containerSize.height || trackCount === 0) return 0;

    if (layoutMode === 'grid') {
      const layout = calcMeetLayout(
        containerSize.width,
        containerSize.height,
        trackCount,
        GRID_GAP,
      );
      if (layout.tileH <= 0) return 0;
      const visibleRows = Math.floor((containerSize.height + GRID_GAP) / (layout.tileH + GRID_GAP));
      return Math.min(layout.cols * visibleRows, trackCount);
    }

    if (layoutMode === 'vertical') {
      const itemHeight = Math.max(120, Math.min(200, containerSize.height));
      return Math.max(1, Math.floor(containerSize.height / (itemHeight + GRID_GAP)));
    }

    // horizontal
    const carouselHeight = 144; // min-h-36 = 9rem = 144px
    const itemWidth = Math.max(150, Math.min(250, carouselHeight * (16 / 9)));
    return Math.max(1, Math.floor(containerSize.width / (itemWidth + GRID_GAP)));
  }, [containerSize.width, containerSize.height, layoutMode, trackCount]);
}

export const VideoGrid = ({ ...props }: VideoConferenceProps) => {
  const lastAutoFocusedScreenShareTrack = React.useRef<TrackReferenceOrPlaceholder | null>(null);

  const carouselType = useCallStore((state) => state.carouselType);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    {
      updateOnlyOn: [RoomEvent.ActiveSpeakersChanged],
      onlySubscribed: false,
    },
  );

  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter((track) => track.publication.source === Track.Source.ScreenShare);

  const hasScreenShare = screenShareTracks.some((track) => track.publication.isSubscribed);
  const participantCount = tracks.filter(
    (track) => track.publication?.source === Track.Source.Camera,
  ).length;
  const canUseFocusLayout = hasScreenShare || participantCount > 2;
  const effectiveCarouselType = canUseFocusLayout ? carouselType : 'grid';

  const contentRef = React.useRef<HTMLDivElement>(null);
  const contentSize = useSize(contentRef as React.RefObject<HTMLDivElement>);

  const firstPageSize = useFirstPageSize(contentSize, effectiveCarouselType, tracks.length);

  const sortedTracks = useSortedTracks(tracks, firstPageSize);

  const layoutContext = useCreateLayoutContext();

  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = sortedTracks.filter((track) => !isEqualTrackRef(track, focusTrack));

  React.useEffect(() => {
    if (
      screenShareTracks.some((track) => track.publication.isSubscribed) &&
      lastAutoFocusedScreenShareTrack.current === null
    ) {
      log.debug('Auto set screen share focus:', { newScreenShareTrack: screenShareTracks[0] });
      layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: screenShareTracks[0] });
      lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
    } else if (
      lastAutoFocusedScreenShareTrack.current &&
      !screenShareTracks.some(
        (track) =>
          track.publication.trackSid ===
          lastAutoFocusedScreenShareTrack.current?.publication?.trackSid,
      )
    ) {
      log.debug('Auto clearing screen share focus.');
      layoutContext.pin.dispatch?.({ msg: 'clear_pin' });
      lastAutoFocusedScreenShareTrack.current = null;
    }
    if (focusTrack && !isTrackReference(focusTrack)) {
      const updatedFocusTrack = tracks.find(
        (tr) =>
          tr.participant.identity === focusTrack.participant.identity &&
          tr.source === focusTrack.source,
      );
      if (updatedFocusTrack !== focusTrack && isTrackReference(updatedFocusTrack)) {
        layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: updatedFocusTrack });
      }
    }
  }, [screenShareTracks, focusTrack, layoutContext.pin, tracks]);

  React.useEffect(() => {
    if (!canUseFocusLayout && (carouselType === 'horizontal' || carouselType === 'vertical')) {
      useCallStore.getState().updateStore('carouselType', 'grid');
    }
  }, [canUseFocusLayout, carouselType]);

  useScreenShareCleanup(tracks);

  return (
    <div className="align-stretch relative flex h-full w-full justify-center" {...props}>
      {isWeb() && (
        <LayoutContextProvider value={layoutContext}>
          <div ref={contentRef} className="flex h-full w-full items-center justify-center">
            {effectiveCarouselType === 'grid' ? (
              <div className="h-full w-full min-w-0">
                <GridLayout tracks={sortedTracks}>
                  <ParticipantTile
                    isFocusToggleDisable
                    style={{
                      flexDirection: 'column',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                    }}
                  />
                </GridLayout>
              </div>
            ) : (
              <div className="h-(--available-height) max-h-(--available-height) w-full overflow-hidden">
                <CarouselContainer focusTrack={focusTrack} carouselTracks={carouselTracks} />
              </div>
            )}
          </div>
        </LayoutContextProvider>
      )}
      <RoomAudioRenderer />
    </div>
  );
};
