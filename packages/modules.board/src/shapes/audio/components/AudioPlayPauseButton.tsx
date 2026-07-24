import { Button } from '@xipkg/button';
import { stopEvent } from '../constants';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('board');
  return (
    <Button
      type="button"
      variant="none"
      size="s"
      disabled={disabled}
      title={disabled ? t('audio.tutorControls') : undefined}
      className="bg-action-primary-background-default hover:bg-action-primary-background-pressed focus:bg-action-primary-background-pressed active:bg-action-primary-background-pressed disabled:bg-background-subtle flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0 disabled:cursor-not-allowed"
      style={{ pointerEvents: 'all' }}
      data-audio-control=""
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
