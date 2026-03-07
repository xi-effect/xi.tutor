import { Button } from '@xipkg/button';
import { stopEvent } from '../constants';

type AudioPlayPauseButtonProps = {
  isPlaying: boolean;
  disabled: boolean;
  onPlayPause: () => void;
};

export function AudioPlayPauseButton({
  isPlaying,
  disabled,
  onPlayPause,
}: AudioPlayPauseButtonProps) {
  return (
    <Button
      type="button"
      variant="none"
      size="s"
      disabled={disabled}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0 disabled:opacity-50"
      style={{ pointerEvents: 'all', backgroundColor: '#3B82F6' }}
      onPointerDown={stopEvent}
      onClick={(e) => {
        e.stopPropagation();
        onPlayPause();
      }}
    >
      {isPlaying ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
          <path d="M4.5 2v12l9-6-9-6z" />
        </svg>
      )}
    </Button>
  );
}
