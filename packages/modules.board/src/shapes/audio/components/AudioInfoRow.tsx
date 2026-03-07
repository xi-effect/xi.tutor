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
  effectiveVolume: number;
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
  isTutor,
  effectiveVolume,
  onAddTimecode,
  onVolumeChange,
  onToggleMute,
}: AudioInfoRowProps) {
  return (
    <div className="flex items-center justify-between" style={{ fontSize: 10, color: '#6B7280' }}>
      <div className="flex items-center gap-1.5">
        {isTutor && (
          <Button
            type="button"
            variant="none"
            className="hover:text-gray-80 flex h-5 min-w-5 items-center justify-center p-0 text-gray-50"
            style={{ pointerEvents: 'all' }}
            onPointerDown={stopEvent}
            onClick={(e) => {
              e.stopPropagation();
              onAddTimecode();
            }}
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
          style={{ pointerEvents: 'all' }}
          onPointerDown={stopEvent}
          onPointerMove={stopEvent}
          onPointerUp={stopEvent}
          onClick={stopEvent}
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
            className="text-gray-60 hover:text-gray-80 flex h-5 min-w-5 shrink-0 items-center justify-center p-0"
            onClick={onToggleMute}
          >
            <SoundTwo
              className="h-3.5 w-3.5"
              style={{ opacity: effectiveVolume === 0 ? 0.5 : 1 }}
            />
          </Button>
        </div>

        {syncPlayback && (
          <span style={{ fontSize: 9, color: '#3B82F6', fontWeight: 500 }}>SYNC</span>
        )}
      </div>
    </div>
  );
}
