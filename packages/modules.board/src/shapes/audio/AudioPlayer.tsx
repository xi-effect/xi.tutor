import { useEffect, useRef, useState } from 'react';
import { useCurrentUser } from 'common.services';
import { useYjsContext } from '../../providers/YjsContext';
import { registerAudioControlGesture } from './boardAudioGesture';
import { stopEvent } from './constants';
import { useAudioLoad } from './hooks/useAudioLoad';
import { useAudioPlayback } from './hooks/useAudioPlayback';
import { useAudioTimecodes } from './hooks/useAudioTimecodes';
import { useIsAudioControlsInteractive, useIsShapeInViewport } from './hooks';
import {
  AudioPlayPauseButton,
  AudioWaveform,
  AudioInfoRow,
  AudioTimecodesList,
  AudioPlayerError,
} from './components';
import { AUDIO_SHAPE_HEIGHT, computeAudioShapeHeight } from './AudioShape';
import type { AudioShape } from './AudioShape';
import { useTranslation } from 'react-i18next';

function useIsSyncPlaybackActive(shape: AudioShape): boolean {
  const { audioSyncMap } = useYjsContext();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!shape.props.syncPlayback || !audioSyncMap) {
      setActive(false);
      return;
    }

    const read = () => {
      setActive(audioSyncMap.get(`${shape.id}:playing`) === 1);
    };

    read();
    const onMap = () => read();
    audioSyncMap.observe(onMap);
    return () => audioSyncMap.unobserve(onMap);
  }, [audioSyncMap, shape.id, shape.props.syncPlayback]);

  return active;
}

type AudioPlayerProps = {
  shape: AudioShape;
};

export const AudioPlayer = ({ shape }: AudioPlayerProps) => {
  const { t } = useTranslation('board');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const isInViewport = useIsShapeInViewport(shape.id);
  const isControlsInteractive = useIsAudioControlsInteractive(shape.id);
  const isSyncActive = useIsSyncPlaybackActive(shape);
  const shouldLoad = isInViewport || isSyncActive;

  const { blobUrl, waveform, status, error } = useAudioLoad(shape, shouldLoad);
  const playback = useAudioPlayback(shape, blobUrl);
  const { addTimecode, removeTimecode, updateTimecodeLabel, toggleTimecodeVisibility } =
    useAudioTimecodes(shape, isTutor);

  const enableRef = useRef<HTMLButtonElement>(null);
  const enableSound = playback.enableSound;

  useEffect(() => {
    const element = enableRef.current;
    if (!element) return;
    return registerAudioControlGesture(element, () => enableSound());
  }, [enableSound, playback.soundBlocked]);

  const visibleTimecodes = isTutor
    ? shape.props.timecodes
    : shape.props.timecodes.filter((t) => t.visibleToAll);

  const cardHeight = computeAudioShapeHeight(visibleTimecodes.length);

  if (error) {
    return (
      <div
        className="bg-background-surface border-border-default overflow-hidden rounded-xl border shadow-md"
        style={{ width: shape.props.w, height: AUDIO_SHAPE_HEIGHT }}
      >
        <AudioPlayerError message={error} />
      </div>
    );
  }

  if (status === 'idle' || status === 'loading' || !shape.props.src) {
    return (
      <div
        className="bg-background-surface border-border-default overflow-hidden rounded-xl border shadow-md"
        style={{ pointerEvents: 'none', width: shape.props.w, height: AUDIO_SHAPE_HEIGHT }}
      >
        <div className="text-text-disabled flex h-full w-full items-center justify-center">
          <span className="text-xs">
            {status === 'idle' ? t('audio.label') : t('audio.loading')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-background-surface border-border-default overflow-hidden rounded-xl border shadow-md"
      data-board-interactive-card=""
      style={{
        pointerEvents: 'none',
        position: 'relative',
        width: shape.props.w,
        height: cardHeight,
      }}
    >
      {playback.soundBlocked && (
        <button
          ref={enableRef}
          type="button"
          data-audio-control=""
          data-audio-action="enable"
          title={t('audio.enableSoundHint')}
          className="bg-action-primary-background-default absolute inset-x-0 top-0 z-10 flex h-11 items-center justify-center px-3 text-xs font-medium text-white"
          style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
          onPointerDown={(event) => {
            stopEvent(event);
            if (event.button !== 0) return;
            playback.enableSound();
          }}
        >
          {t('audio.enableSound')}
        </button>
      )}
      <div className="flex h-[80px] shrink-0 items-center gap-3 px-3">
        <AudioPlayPauseButton
          isPlaying={playback.localIsPlaying}
          disabled={!playback.canControl}
          onPlayPause={playback.togglePlay}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <AudioWaveform
            waveform={waveform}
            progress={playback.progress}
            duration={playback.duration}
            canControl={playback.canControl}
            isInteractive={isControlsInteractive}
            onSeek={playback.seekToTime}
          />

          <AudioInfoRow
            currentTime={playback.currentTime}
            duration={playback.duration}
            fileSize={shape.props.fileSize}
            isPlaying={playback.localIsPlaying}
            syncPlayback={shape.props.syncPlayback}
            isTutor={isTutor}
            canAddTimecode={isTutor || shape.props.studentsCanAddTimecodes}
            effectiveVolume={playback.effectiveVolume}
            isInteractive={isControlsInteractive}
            onAddTimecode={() => addTimecode(playback.currentTime)}
            onVolumeChange={playback.onVolumeChange}
            onToggleMute={playback.toggleMute}
          />
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto"
        style={{ maxHeight: cardHeight - AUDIO_SHAPE_HEIGHT }}
      >
        <AudioTimecodesList
          timecodes={visibleTimecodes}
          isTutor={isTutor}
          canSeekTimecodes={playback.canControl}
          isInteractive={isControlsInteractive}
          onSeek={playback.seekToTime}
          onLabelChange={updateTimecodeLabel}
          onToggleVisibility={toggleTimecodeVisibility}
          onRemove={removeTimecode}
        />
      </div>
    </div>
  );
};
