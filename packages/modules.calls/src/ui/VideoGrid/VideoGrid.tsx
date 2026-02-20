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
import { CarouselContainer, GridLayout } from './VideoGridLayout';
import { useCallStore } from '../../store/callStore';
import { useScreenShareCleanup } from '../../hooks/useScreenShareCleanup';
import '../../styles/grid.css';

export const VideoGrid = ({ ...props }: VideoConferenceProps) => {
  const lastAutoFocusedScreenShareTrack = React.useRef<TrackReferenceOrPlaceholder | null>(null);

  // Получаем тип карусели из store
  const carouselType = useCallStore((state) => state.carouselType);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    {
      updateOnlyOn: [RoomEvent.ActiveSpeakersChanged],
      onlySubscribed: false, // Получаем все треки, включая неподписанные для корректного подсчета участников
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
  }, [screenShareTracks, focusTrack, layoutContext.pin, tracks]);

  // Автоматическое переключение на grid при нарушении условий
  React.useEffect(() => {
    if (!canUseFocusLayout && (carouselType === 'horizontal' || carouselType === 'vertical')) {
      // Переключаемся на grid в store
      useCallStore.getState().updateStore('carouselType', 'grid');
    }
  }, [canUseFocusLayout, carouselType]);

  // Автоматическое удаление треков демонстрации экрана при их завершении
  useScreenShareCleanup(tracks);

  return (
    <div className="align-stretch relative flex h-full w-full justify-center" {...props}>
      {isWeb() && (
        <LayoutContextProvider value={layoutContext}>
          <div className="flex h-full w-full items-center justify-center">
            {effectiveCarouselType === 'grid' ? (
              <div className="h-full w-full min-w-0">
                <GridLayout tracks={tracks}>
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
              <div className="h-[var(--available-height)] max-h-[var(--available-height)] w-full overflow-hidden">
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
