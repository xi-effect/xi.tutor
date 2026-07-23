import { Slider } from '@xipkg/slider';
import { Button } from '@xipkg/button';
import { SoundTwo, Plus } from '@xipkg/icons';
import { stopEvent } from '../constants';
import { formatTime, formatFileSize } from '../utils';

type AudioInfoRowProps = {
  currentTime: number;
  duration: number;
  fileSize: number;
  isPlaying: boolean;
  syncPlayback: boolean;
  isTutor: boolean;
  canAddTimecode: boolean;
  effectiveVolume: number;
  isInteractive: boolean;
  onAddTimecode: () => void;
  onVolumeChange: (value: number[]) => void;
  onToggleMute: () => void;
};

export function AudioInfoRow({
  currentTime,
  duration,
  fileSize,
  isPlaying,
  syncPlayback,
  canAddTimecode,
  effectiveVolume,
  isInteractive,
  onAddTimecode,
  onVolumeChange,
  onToggleMute,
}: AudioInfoRowProps) {
  return (
    <div className="text-text-secondary flex items-center justify-between text-[10px]">
      <div className="flex items-center gap-1.5">
        {canAddTimecode && (
          <Button
            type="button"
            variant="none"
            className="hover:text-text-primary text-text-muted flex h-5 min-w-5 items-center justify-center p-0"
            style={{ pointerEvents: isInteractive ? 'all' : 'none' }}
            data-audio-control=""
            onPointerDown={isInteractive ? stopEvent : undefined}
            onClick={
              isInteractive
                ? (e) => {
                    e.stopPropagation();
                    onAddTimecode();
                  }
                : undefined
            }
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
        <span>
          {isPlaying
            ? `${formatTime(currentTime)} / ${formatTime(duration)}`
            : `${formatTime(duration)}, ${formatFileSize(fileSize)}`}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <div
          className="group flex items-center gap-1.5"
          style={{ pointerEvents: isInteractive ? 'all' : 'none' }}
          data-audio-control=""
          onPointerDown={isInteractive ? stopEvent : undefined}
          onPointerMove={isInteractive ? stopEvent : undefined}
          onPointerUp={isInteractive ? stopEvent : undefined}
          onClick={isInteractive ? stopEvent : undefined}
        >
          <div className="flex min-h-6 max-w-0 min-w-0 items-center overflow-hidden opacity-0 transition-[max-width,opacity] duration-150 group-hover:max-w-[80px] group-hover:opacity-100">
            <Slider
              value={[effectiveVolume]}
              onValueChange={onVolumeChange}
              min={0}
              max={1}
              step={0.01}
              className="h-6 w-[80px] shrink-0"
            />
          </div>
          <Button
            type="button"
            variant="none"
            size="s"
            className="text-text-secondary hover:text-text-primary flex h-5 min-w-5 shrink-0 items-center justify-center p-0"
            onClick={onToggleMute}
          >
            <SoundTwo
              className="h-3.5 w-3.5"
              style={{ opacity: effectiveVolume === 0 ? 0.5 : 1 }}
            />
          </Button>
        </div>

        {syncPlayback && <span className="text-xxs-base">Вместе</span>}
      </div>
    </div>
  );
}
