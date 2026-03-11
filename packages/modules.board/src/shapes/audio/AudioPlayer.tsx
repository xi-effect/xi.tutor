import { useCurrentUser } from 'common.services';
import { useYjsContext } from '../../providers/YjsProvider';
import { useAudioLoad } from './hooks/useAudioLoad';
import { useAudioPlayback } from './hooks/useAudioPlayback';
import { useAudioTimecodes } from './hooks/useAudioTimecodes';
import { useIsShapeInViewport } from './hooks/useIsShapeInViewport';
import {
  AudioPlayPauseButton,
  AudioWaveform,
  AudioInfoRow,
  AudioTimecodesList,
  AudioPlayerError,
} from './components';
import { AUDIO_SHAPE_HEIGHT, computeAudioShapeHeight } from './AudioShape';
import type { AudioShape } from './AudioShape';

function useIsSyncPlaybackActive(shape: AudioShape): boolean {
  const { audioSyncMap } = useYjsContext();
  if (!shape.props.syncPlayback || !audioSyncMap) return false;
  return audioSyncMap.get(`${shape.id}:playing`) === 1;
}

type AudioPlayerProps = {
  shape: AudioShape;
};

export const AudioPlayer = ({ shape }: AudioPlayerProps) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const isInViewport = useIsShapeInViewport(shape.id);
  const isSyncActive = useIsSyncPlaybackActive(shape);
  const shouldLoad = isInViewport || isSyncActive;

  const { blobUrl, waveform, status, error } = useAudioLoad(shape, shouldLoad);
  const playback = useAudioPlayback(shape, blobUrl);
  const { addTimecode, removeTimecode, updateTimecodeLabel, toggleTimecodeVisibility } =
    useAudioTimecodes(shape, isTutor);

  const visibleTimecodes = isTutor
    ? shape.props.timecodes
    : shape.props.timecodes.filter((t) => t.visibleToAll);

  const cardHeight = computeAudioShapeHeight(visibleTimecodes.length);

  if (error) {
    return (
      <div
        className="bg-gray-0 border-gray-10 overflow-hidden rounded-xl border shadow-md"
        style={{ width: shape.props.w, height: AUDIO_SHAPE_HEIGHT }}
      >
        <AudioPlayerError message={error} />
      </div>
    );
  }

  if (status === 'idle' || status === 'loading' || !shape.props.src) {
    return (
      <div
        className="bg-gray-0 border-gray-10 overflow-hidden rounded-xl border shadow-md"
        style={{ pointerEvents: 'none', width: shape.props.w, height: AUDIO_SHAPE_HEIGHT }}
      >
        <div className="text-gray-40 flex h-full w-full items-center justify-center">
          <span className="text-xs">{status === 'idle' ? 'Аудио' : 'Загрузка...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-gray-0 border-gray-10 overflow-hidden rounded-xl border shadow-md"
      style={{ pointerEvents: 'none', width: shape.props.w, height: cardHeight }}
    >
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
            canControl={playback.canControl}
            onSeek={playback.seekTo}
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
          onSeek={playback.seekToTime}
          onLabelChange={updateTimecodeLabel}
          onToggleVisibility={toggleTimecodeVisibility}
          onRemove={removeTimecode}
        />
      </div>
    </div>
  );
};
