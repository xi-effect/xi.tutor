import { useCurrentUser } from 'common.services';
import { useAudioLoad } from './hooks/useAudioLoad';
import { useAudioPlayback } from './hooks/useAudioPlayback';
import { useAudioTimecodes } from './hooks/useAudioTimecodes';
import { AudioPlayPauseButton } from './components/AudioPlayPauseButton';
import { AudioWaveform } from './components/AudioWaveform';
import { AudioInfoRow } from './components/AudioInfoRow';
import { AudioTimecodesList } from './components/AudioTimecodesList';
import { AudioPlayerError } from './components/AudioPlayerError';
import { parseBooleanAttr, parseTimecodes, type AudioNodeAttrs } from './audioTypes';
import { useTranslation } from 'react-i18next';

type AudioPlayerProps = {
  nodeId: string;
  attrs: Record<string, unknown>;
  blobUrl: string;
  isReadOnly?: boolean;
  updateAttributes: (attrs: Record<string, unknown>) => void;
};

function toAudioAttrs(attrs: Record<string, unknown>): AudioNodeAttrs {
  return {
    src: String(attrs.src ?? ''),
    fileName: String(attrs.fileName ?? ''),
    fileSize: Number(attrs.fileSize) || 0,
    duration: Number(attrs.duration) || 0,
    syncPlayback: parseBooleanAttr(attrs.syncPlayback, false),
    studentsCanAddTimecodes: parseBooleanAttr(attrs.studentsCanAddTimecodes, false),
    timecodesVisibleByDefault: parseBooleanAttr(attrs.timecodesVisibleByDefault, true),
    studentsCanControlPlayback: parseBooleanAttr(attrs.studentsCanControlPlayback, false),
    timecodes: parseTimecodes(attrs.timecodes),
  };
}

export const AudioPlayer = ({
  nodeId,
  attrs: rawAttrs,
  blobUrl,
  isReadOnly,
  updateAttributes,
}: AudioPlayerProps) => {
  const { t } = useTranslation('editor');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const attrs = toAudioAttrs(rawAttrs);

  const { waveform, status, error } = useAudioLoad(blobUrl);
  const playback = useAudioPlayback(nodeId, attrs, blobUrl, updateAttributes);
  const { addTimecode, removeTimecode, updateTimecodeLabel, toggleTimecodeVisibility } =
    useAudioTimecodes(attrs, updateAttributes, isTutor);

  const visibleTimecodes = isTutor
    ? attrs.timecodes
    : attrs.timecodes.filter((item) => item.visibleToAll);

  const canAddTimecode = !isReadOnly && (isTutor || attrs.studentsCanAddTimecodes);

  if (error) {
    return (
      <div className="bg-background-surface border-border-default overflow-hidden rounded-xl border shadow-md">
        <AudioPlayerError message={error} />
      </div>
    );
  }

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="bg-background-surface border-border-default overflow-hidden rounded-xl border shadow-md">
        <div className="text-text-disabled flex h-20 w-full items-center justify-center">
          <span className="text-xs">{t('audio.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-surface border-border-default overflow-hidden rounded-xl border shadow-md">
      <div className="flex h-[80px] shrink-0 items-center gap-3 px-3">
        <AudioPlayPauseButton
          isPlaying={playback.localIsPlaying}
          disabled={!playback.canControl}
          onPlayPause={playback.togglePlay}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="pr-12">
            <AudioWaveform
              waveform={waveform}
              progress={playback.progress}
              canControl={playback.canControl}
              onSeek={playback.seekTo}
            />
          </div>

          <AudioInfoRow
            currentTime={playback.currentTime}
            duration={playback.duration}
            fileSize={attrs.fileSize}
            isPlaying={playback.localIsPlaying}
            syncPlayback={attrs.syncPlayback}
            canAddTimecode={canAddTimecode}
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
