/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Participant, Track } from 'livekit-client';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { isTrackReference, isTrackReferencePinned } from '@livekit/components-core';
import {
  AudioTrack,
  LockLockedIcon,
  ParticipantContextIfNeeded,
  ParticipantTileProps,
  ScreenShareIcon,
  TrackMutedIndicatorProps,
  TrackRefContext,
  useEnsureParticipant,
  useFeatureContext,
  useIsEncrypted,
  useMaybeLayoutContext,
  useMaybeTrackRefContext,
  useParticipantTile,
  useTrackMutedIndicator,
  useParticipantInfo,
} from '@livekit/components-react';
import { MicrophoneOff, RedLine } from '@xipkg/icons';
import { VideoTrack } from '../shared';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { FocusToggle } from '../shared/FocusToggle';
import { ParticipantName } from './ParticipantName';
import { RaisedHandIndicator } from './RaisedHandIndicator';
import { ScreenShareZoom } from './ScreenShareZoom';
import { useCallStore } from '../../store/callStore';
import { cn } from '@xipkg/utils';

type TrackRefContextIfNeededPropsT = {
  trackRef?: TrackReferenceOrPlaceholder;
  children?: React.ReactNode;
};

const TrackRefContextIfNeeded = ({ trackRef, children }: TrackRefContextIfNeededPropsT) => {
  const hasContext = !!useMaybeTrackRefContext();
  return trackRef && !hasContext ? (
    <TrackRefContext.Provider value={trackRef}>{children}</TrackRefContext.Provider>
  ) : (
    children
  );
};

export const TrackMutedIndicator = ({
  trackRef,
  show = 'always',
  ...props
}: TrackMutedIndicatorProps) => {
  const { isMuted } = useTrackMutedIndicator(trackRef);

  const showIndicator =
    show === 'always' || (show === 'muted' && isMuted) || (show === 'unmuted' && !isMuted);

  if (!showIndicator) {
    return null;
  }

  return (
    <div data-lk-muted={isMuted}>
      {(props.children ?? isMuted) ? (
        <div className="relative w-3">
          <MicrophoneOff className="absolute h-4 w-4 fill-gray-100" />
          <RedLine className="fill-red-80 absolute h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
};

type FocusToggleDisablePropsT = {
  isFocusToggleDisable?: boolean;
};

type FocusViewPropsT = {
  /** Плитка в фокусе (в HorizontalFocusLayout / VerticalFocusLayout). Для демонстрации экрана включает зум. */
  isFocusView?: boolean;
};

type ParticipantTilePropsT = ParticipantTileProps &
  FocusToggleDisablePropsT &
  FocusViewPropsT & {
    participant?: Participant;
    source?: Track.Source;
    publication?: unknown;
  };

export const ParticipantTile = ({
  trackRef,
  participant,
  children,
  source = Track.Source.Camera,
  onParticipantClick,
  publication,
  disableSpeakingIndicator,
  isFocusToggleDisable,
  isFocusView,
  ...htmlProps
}: ParticipantTilePropsT) => {
  const maybeTrackRef = useMaybeTrackRefContext();
  const p = useEnsureParticipant(participant);

  const trackReference: TrackReferenceOrPlaceholder = React.useMemo(
    () => ({
      participant: trackRef?.participant ?? maybeTrackRef?.participant ?? p,
      source: trackRef?.source ?? maybeTrackRef?.source ?? source,
      publication: trackRef?.publication ?? maybeTrackRef?.publication ?? (publication as any),
    }),
    [maybeTrackRef, p, publication, source, trackRef],
  );

  const { identity } = useParticipantInfo({ participant: trackReference.participant });

  // Принудительное обновление при изменении трека
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  // Отслеживаем изменения состояния трека
  React.useEffect(() => {
    if (trackReference.publication) {
      const handleTrackChanged = () => {
        forceUpdate();
      };

      // Слушаем изменения трека
      trackReference.publication.track?.on('muted', handleTrackChanged);
      trackReference.publication.track?.on('unmuted', handleTrackChanged);

      // Слушаем изменения публикации
      trackReference.publication.on('subscribed', handleTrackChanged);
      trackReference.publication.on('unsubscribed', handleTrackChanged);

      return () => {
        trackReference.publication.track?.off('muted', handleTrackChanged);
        trackReference.publication.track?.off('unmuted', handleTrackChanged);
        trackReference.publication.off('subscribed', handleTrackChanged);
        trackReference.publication.off('unsubscribed', handleTrackChanged);
      };
    }
  }, [trackReference.publication]);

  const { elementProps } = useParticipantTile<HTMLDivElement>({
    htmlProps,
    disableSpeakingIndicator,
    onParticipantClick,
    trackRef: trackReference,
  });
  const isEncrypted = useIsEncrypted(p);
  const layoutContext = useMaybeLayoutContext();

  const autoManageSubscription = useFeatureContext()?.autoSubscription;

  const handleSubscribe = React.useCallback(
    (subscribed: boolean) => {
      if (
        trackReference.source &&
        !subscribed &&
        layoutContext?.pin.dispatch &&
        isTrackReferencePinned(trackReference, layoutContext.pin.state)
      ) {
        layoutContext.pin.dispatch({ msg: 'clear_pin' });
      }
    },
    [trackReference, layoutContext],
  );

  const carouselType = useCallStore((state) => state.carouselType);

  const isHorizontalLayout = carouselType === 'horizontal';

  const getVideoClassName = () => {
    if (trackReference.source === Track.Source.ScreenShare) {
      return 'object-contain';
    }

    if (isHorizontalLayout) {
      return 'object-contain';
    }
    return 'object-cover';
  };

  return (
    <div
      className="lk-participant-tile relative"
      data-lk-source={trackReference.source}
      {...elementProps}
    >
      <TrackRefContextIfNeeded trackRef={trackReference}>
        <ParticipantContextIfNeeded participant={trackReference.participant}>
          <div className="m-auto flex aspect-video h-full w-full justify-center overflow-hidden rounded-xl in-[.lk-grid-layout]:relative in-[.lk-grid-layout]:overflow-hidden in-[.lk-grid-layout]:rounded-2xl [.lk-grid-layout_&]:m-0 [.lk-grid-layout_&]:flex-none [.lk-grid-layout_&]:bg-black">
            {children ?? (
              <div className="relative flex h-full w-full justify-center in-[.lk-grid-layout]:relative in-[.lk-grid-layout]:h-full in-[.lk-grid-layout]:w-full">
                {/* Аватар только когда камера выключена; для демонстрации экрана — только нейтральный фон */}
                {(() => {
                  const isScreenShare = trackReference.source === Track.Source.ScreenShare;
                  const hasVideo =
                    isTrackReference(trackReference) &&
                    (trackReference.publication?.kind === 'video' ||
                      trackReference.source === Track.Source.Camera ||
                      trackReference.source === Track.Source.ScreenShare) &&
                    trackReference.publication?.isSubscribed &&
                    trackReference.publication?.isEnabled &&
                    !trackReference.publication?.track?.isMuted;
                  const showAvatar =
                    !isScreenShare && trackReference.source === Track.Source.Camera && !hasVideo;
                  return showAvatar ? (
                    <div
                      style={{
                        borderRadius: '8px',
                        height: '100%',
                        backgroundColor: 'var(--color-gray-40)',
                      }}
                      className="lk-participant-placeholder flex aspect-video h-full w-full items-center justify-center"
                    >
                      <Avatar size="xxl">
                        <AvatarImage
                          src={`https://api.sovlium.ru/files/users/${identity}/avatar.webp`}
                          alt="user avatar"
                        />
                        <AvatarFallback size="xxl" loading />
                      </Avatar>
                    </div>
                  ) : (
                    <div
                      className="lk-participant-placeholder bg-gray-40 aspect-video h-full w-full rounded-lg"
                      aria-hidden
                    />
                  );
                })()}
                {/* Видео накладывается поверх когда доступно (камера или демонстрация) */}
                {isTrackReference(trackReference) &&
                  (trackReference.publication?.kind === 'video' ||
                    trackReference.source === Track.Source.Camera ||
                    trackReference.source === Track.Source.ScreenShare) &&
                  trackReference.publication?.isSubscribed &&
                  trackReference.publication?.isEnabled &&
                  !trackReference.publication?.track?.isMuted &&
                  (() => {
                    const videoBlock = (
                      <div className="absolute inset-0 aspect-video h-full w-full bg-gray-100/80">
                        <VideoTrack
                          className={cn(
                            `absolute inset-0 h-full w-full object-cover object-center ${getVideoClassName()}`,
                          )}
                          style={{
                            ...(trackReference.source === Track.Source.Camera && {
                              transform: 'rotateY(180deg)',
                            }),
                            boxSizing: 'border-box',
                            background: 'var(--xi-bg-gray-100)',
                            backgroundColor: 'var(--xi-bg-gray-100)',
                          }}
                          trackRef={trackReference}
                          onSubscriptionStatusChanged={handleSubscribe}
                          manageSubscription={autoManageSubscription}
                        />
                      </div>
                    );
                    return isFocusView && trackReference.source === Track.Source.ScreenShare ? (
                      <ScreenShareZoom trackRef={trackReference}>{videoBlock}</ScreenShareZoom>
                    ) : (
                      videoBlock
                    );
                  })()}
                {/* Аудио трек для случаев без видео */}
                {isTrackReference(trackReference) &&
                  (!trackReference.publication?.isSubscribed ||
                    trackReference.publication?.kind !== 'video' ||
                    trackReference.publication?.track?.isMuted) && (
                    <AudioTrack
                      trackRef={trackReference}
                      onSubscriptionStatusChanged={handleSubscribe}
                    />
                  )}
                <div className="lk-participant-metadata absolute right-2 bottom-2 left-2 z-10 flex items-center justify-between gap-2">
                  <div>
                    {trackReference.source === Track.Source.Camera ? (
                      <div className="bg-gray-0/80 flex h-6 gap-1.5 rounded-lg px-1.5 py-1 backdrop-blur">
                        {isEncrypted && <LockLockedIcon />}
                        <TrackMutedIndicator
                          trackRef={{
                            participant: trackReference.participant,
                            source: Track.Source.Microphone,
                          }}
                          show="muted"
                          style={{ marginRight: '0.45rem', background: 'transparent' }}
                        />
                        <ParticipantName participant={trackReference.participant} />
                      </div>
                    ) : (
                      <div className="bg-gray-0/80 flex h-6 items-center gap-1.5 rounded-lg px-1.5 py-1 backdrop-blur">
                        <ScreenShareIcon style={{ marginRight: '0.25rem' }} />
                        <ParticipantName participant={trackReference.participant}>
                          Демонстрация&nbsp;
                        </ParticipantName>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Индикатор поднятой руки в верхнем правом углу - скрываем для ScreenShare */}
          {trackReference.source !== Track.Source.ScreenShare && (
            <div className="absolute top-2 left-2 z-10">
              <RaisedHandIndicator participantId={identity || 'unknown'} />
            </div>
          )}

          {isFocusToggleDisable ? null : (
            <FocusToggle
              style={{ background: 'transparent', padding: '5px' }}
              trackRef={trackReference}
            />
          )}
        </ParticipantContextIfNeeded>
      </TrackRefContextIfNeeded>
    </div>
  );
};
