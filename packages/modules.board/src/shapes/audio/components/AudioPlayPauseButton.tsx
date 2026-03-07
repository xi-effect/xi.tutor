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
      title={disabled ? 'Управление у репетитора' : undefined}
      className="bg-brand-80 hover:bg-brand-100 focus:bg-brand-100 active:bg-brand-100 disabled:bg-gray-40 flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0 disabled:pointer-events-auto disabled:cursor-not-allowed"
      style={{ pointerEvents: 'all' }}
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
