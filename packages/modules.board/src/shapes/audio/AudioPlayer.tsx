import { useCurrentUser } from 'common.services';
import { useAudioLoad } from './hooks/useAudioLoad';
import { useAudioPlayback } from './hooks/useAudioPlayback';
import { useAudioTimecodes } from './hooks/useAudioTimecodes';
import {
  AudioPlayPauseButton,
  AudioWaveform,
  AudioInfoRow,
  AudioTimecodesList,
  AudioPlayerError,
} from './components';
import type { AudioShape } from './AudioShape';

type AudioPlayerProps = {
  shape: AudioShape;
};

export const AudioPlayer = ({ shape }: AudioPlayerProps) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const { blobUrl, waveform, loading, error } = useAudioLoad(shape);
  const playback = useAudioPlayback(shape, blobUrl);
  const { addTimecode, removeTimecode, updateTimecodeLabel, toggleTimecodeVisibility } =
    useAudioTimecodes(shape, isTutor);

  const visibleTimecodes = isTutor
    ? shape.props.timecodes
    : shape.props.timecodes.filter((t) => t.visibleToAll);

  if (error) {
    return <AudioPlayerError message={error} />;
  }

  if (loading || !shape.props.src) {
    return (
      <div
        style={{ pointerEvents: 'none' }}
        className="text-gray-40 flex h-full w-full items-center justify-center"
      >
        <span className="text-xs">Загрузка...</span>
      </div>
    );
  }

  return (
    <div style={{ pointerEvents: 'none' }} className="flex h-full flex-col select-none">
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
  );
};
