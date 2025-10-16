/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import '@livekit/components-styles';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { isEqualTrackRef, isTrackReference, isWeb, log } from '@livekit/components-core';
import { RoomEvent, Track } from 'livekit-client';
import {
  ConnectionStateToast,
  LayoutContextProvider,
  RoomAudioRenderer,
  VideoConferenceProps,
  useCreateLayoutContext,
  usePinnedTracks,
  useTracks,
} from '@livekit/components-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ParticipantTile } from '../Participant';
import { CarouselContainer, GridLayout } from './VideoGridLayout';
import { SearchParams } from '../../types/router';
import '../../styles/grid.css';

export const VideoGrid = ({ ...props }: VideoConferenceProps) => {
  const navigate = useNavigate();
  const search: SearchParams = useSearch({ strict: false });

  const lastAutoFocusedScreenShareTrack = React.useRef<TrackReferenceOrPlaceholder | null>(null);

  // Получаем тип карусели из URL параметров
  const carouselType = search.carouselType || 'grid';

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    {
      updateOnlyOn: [RoomEvent.ActiveSpeakersChanged],
      onlySubscribed: true, // Оптимизация: подписываемся только на активные треки
    },
  );

  const layoutContext = useCreateLayoutContext();

  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter((track) => track.publication.source === Track.Source.ScreenShare);

  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter((track) => !isEqualTrackRef(track, focusTrack));

  // Проверяем условия для FocusLayout
  const hasScreenShare = screenShareTracks.some((track) => track.publication.isSubscribed);
  const participantCount = tracks.filter(
    (track) => track.publication?.source === Track.Source.Camera,
  ).length;

  // Определяем, можно ли использовать FocusLayout
  const canUseFocusLayout = hasScreenShare || participantCount > 2;

  // Если условия не соблюдены, принудительно переключаемся на grid
  const effectiveCarouselType = canUseFocusLayout ? carouselType : 'grid';

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
  }, [
    screenShareTracks
      .map((ref) => `${ref.publication.trackSid}_${ref.publication.isSubscribed}`)
      .join(),
    focusTrack?.publication?.trackSid,
    tracks,
  ]);

  React.useEffect(() => {
    const carouselType = search.carouselType;
    if (carouselType === 'horizontal' || carouselType === 'vertical') {
      layoutContext.pin.dispatch?.({
        msg: 'set_pin',
        trackReference: lastAutoFocusedScreenShareTrack.current ? screenShareTracks[0] : tracks[0],
      });
      // @ts-expect-error
      navigate({ search: { ...search, carouselType } });
    } else if (!carouselType) {
      layoutContext.pin.dispatch?.({ msg: 'clear_pin' });
      // eslint-disable-next-line
      const { carouselType: _, ...restSearch } = search;
      // @ts-expect-error
      navigate({ search: restSearch });
    }
  }, [search, navigate]);

  // Автоматическое переключение на grid при нарушении условий
  React.useEffect(() => {
    if (!canUseFocusLayout && (carouselType === 'horizontal' || carouselType === 'vertical')) {
      // @ts-expect-error
      navigate({ search: { ...search, carouselType: undefined } });
    }
  }, [canUseFocusLayout, carouselType, search, navigate]);

  return (
    <div className="lk-video-conference" {...props}>
      {isWeb() && (
        <LayoutContextProvider value={layoutContext}>
          <div className="lk-video-conference-inner">
            {effectiveCarouselType === 'grid' ? (
              <div className="h-full">
                <GridLayout tracks={tracks}>
                  <ParticipantTile
                    isFocusToggleDisable
                    style={{ flexDirection: 'column', maxWidth: '100%', maxHeight: '100%' }}
                  />
                </GridLayout>
              </div>
            ) : (
              <div className="lk-focus-layout-wrapper">
                <CarouselContainer focusTrack={focusTrack} carouselTracks={carouselTracks} />
              </div>
            )}
          </div>
        </LayoutContextProvider>
      )}
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
};
