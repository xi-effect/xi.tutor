import { useEffect, useRef } from 'react';
import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { registerAudioControlGesture } from '../boardAudioGesture';
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
  const { t } = useTranslation('board');
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return;
    return registerAudioControlGesture(element, () => onPlayPause());
  }, [disabled, onPlayPause]);

  return (
    <span
      ref={ref}
      data-audio-control=""
      data-audio-action="play"
      className="inline-flex shrink-0"
      style={{ touchAction: 'manipulation' }}
    >
      <Button
        type="button"
        variant="none"
        size="s"
        disabled={disabled}
        title={disabled ? t('audio.tutorControls') : undefined}
        className="bg-action-primary-background-default hover:bg-action-primary-background-pressed focus:bg-action-primary-background-pressed active:bg-action-primary-background-pressed disabled:bg-background-subtle flex h-11 w-11 shrink-0 items-center justify-center rounded-full p-0 disabled:cursor-not-allowed"
        style={{ pointerEvents: 'auto' }}
        onPointerDown={(event) => {
          stopEvent(event);
          if (event.button !== 0 || disabled) return;
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
    </span>
  );
}
