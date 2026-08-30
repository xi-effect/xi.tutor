import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@xipkg/button';
import { ArrowLeft, ArrowRight, SoundTwo } from '@xipkg/icons';
import { Slider } from '@xipkg/slider';
import { audioWaveformCache } from './audioWaveformCache';
import { formatMediaTime } from './formatMediaTime';

const SKIP_SECONDS = 10;
const WAVEFORM_HEIGHT = 88;

type AudioPreviewProps = {
  blobUrl: string;
  isFullscreen?: boolean;
  onDuration: (duration: number) => void;
  onError: () => void;
};

const WaveformBars = memo(({ waveform }: { waveform: number[] }) => (
  <>
    {waveform.map((amp, index) => {
      const count = waveform.length || 1;
      const barW = 100 / count;
      const gapRatio = 0.35;
      const barHeight = Math.max(8, amp * (WAVEFORM_HEIGHT - 8));

      return (
        <rect
          key={index}
          x={index * barW + (barW * gapRatio) / 2}
          y={(WAVEFORM_HEIGHT - barHeight) / 2}
          width={barW * (1 - gapRatio)}
          height={barHeight}
          rx={1.5}
        />
      );
    })}
  </>
));

WaveformBars.displayName = 'WaveformBars';

const progressClipPath = (time: number, duration: number) => {
  if (duration <= 0) return 'inset(0 100% 0 0)';
  const ratio = Math.min(Math.max(time / duration, 0), 1);
  return `inset(0 ${(1 - ratio) * 100}% 0 0)`;
};

export const AudioPreview = ({
  blobUrl,
  isFullscreen = false,
  onDuration,
  onError,
}: AudioPreviewProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedLayerRef = useRef<SVGSVGElement | null>(null);
  const durationRef = useRef(0);
  const onDurationRef = useRef(onDuration);
  onDurationRef.current = onDuration;

  const [waveform, setWaveform] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  durationRef.current = duration;

  const syncProgress = useCallback((time: number) => {
    const layer = playedLayerRef.current;
    if (!layer) return;
    layer.style.clipPath = progressClipPath(time, durationRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    audioWaveformCache.get(blobUrl).then((bars) => {
      if (!cancelled) setWaveform(bars);
    });
    return () => {
      cancelled = true;
    };
  }, [blobUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    syncProgress(0);

    const applyDuration = () => {
      const next = audio.duration;
      if (Number.isFinite(next) && next > 0) {
        setDuration(next);
        onDurationRef.current(next);
        return;
      }
      setDuration(0);
    };

    applyDuration();
    audio.addEventListener('loadedmetadata', applyDuration);
    audio.addEventListener('durationchange', applyDuration);
    return () => {
      audio.removeEventListener('loadedmetadata', applyDuration);
      audio.removeEventListener('durationchange', applyDuration);
    };
  }, [blobUrl, syncProgress]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!isPlaying) return;

    let raf = 0;
    let lastShownSecond = Number.NaN;

    const tick = () => {
      const audio = audioRef.current;
      if (audio) {
        const time = audio.currentTime;
        syncProgress(time);
        const second = Math.floor(time);
        if (second !== lastShownSecond) {
          lastShownSecond = second;
          setCurrentTime(time);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, syncProgress]);

  const seekTo = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio || !Number.isFinite(audio.duration)) return;
      const next = Math.min(Math.max(time, 0), audio.duration);
      audio.currentTime = next;
      setCurrentTime(next);
      syncProgress(next);
    },
    [syncProgress],
  );

  const seekFromPointer = (event: { currentTarget: HTMLElement; clientX: number }) => {
    if (duration <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    seekTo(ratio * duration);
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setCurrentTime(audio.currentTime);
      syncProgress(audio.currentTime);
      return;
    }

    try {
      await audio.play();
    } catch {
      onError();
    }
  };

  return (
    <div
      className={
        isFullscreen ? 'flex min-h-0 w-full flex-1 flex-col' : 'flex w-full flex-col gap-6'
      }
    >
      <audio
        ref={audioRef}
        src={blobUrl}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setCurrentTime(durationRef.current);
          syncProgress(durationRef.current);
        }}
        onError={onError}
      />

      <div
        className={
          isFullscreen
            ? 'flex min-h-0 w-full flex-1 flex-col items-center justify-center px-4'
            : 'contents'
        }
      >
        <div
          className={isFullscreen ? 'flex w-full max-w-3xl flex-col gap-2' : 'flex flex-col gap-2'}
        >
          <div
            className="relative w-full cursor-pointer"
            role="slider"
            aria-label="Позиция воспроизведения"
            aria-valuemin={0}
            aria-valuemax={duration || 0}
            aria-valuenow={currentTime}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              seekFromPointer(event);
            }}
            onPointerMove={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
              seekFromPointer(event);
            }}
          >
            <svg
              className="block w-full"
              height={isFullscreen ? WAVEFORM_HEIGHT * 1.5 : WAVEFORM_HEIGHT}
              viewBox={`0 0 100 ${WAVEFORM_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <g className="fill-icon-disabled">
                <WaveformBars waveform={waveform} />
              </g>
            </svg>
            <svg
              ref={playedLayerRef}
              className="pointer-events-none absolute inset-0 block h-full w-full"
              viewBox={`0 0 100 ${WAVEFORM_HEIGHT}`}
              preserveAspectRatio="none"
              style={{ clipPath: 'inset(0 100% 0 0)' }}
            >
              <g className="fill-icon-brand">
                <WaveformBars waveform={waveform} />
              </g>
            </svg>
          </div>
          <div className="text-text-secondary flex items-center justify-between text-xs tabular-nums">
            <span>{formatMediaTime(currentTime)}</span>
            <span>{formatMediaTime(duration)}</span>
          </div>
        </div>
      </div>

      <div
        className={
          isFullscreen
            ? 'relative mx-auto flex w-full max-w-3xl shrink-0 items-center justify-center px-4 pt-4 pb-2'
            : 'relative flex items-center justify-center'
        }
      >
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="none"
            size="s"
            className="bg-background-subtle hover:bg-background-page flex size-10 items-center justify-center rounded-full p-0"
            onClick={() => seekTo(currentTime - SKIP_SECONDS)}
            aria-label="-10s"
          >
            <ArrowLeft className="fill-icon-primary size-4" />
          </Button>
          <Button
            type="button"
            variant="none"
            size="s"
            className="bg-action-primary-background-default hover:bg-action-primary-background-hover flex size-14 items-center justify-center rounded-full p-0"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
                <rect x="3" y="2" width="4" height="12" rx="1" />
                <rect x="9" y="2" width="4" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
                <path d="M4.5 2v12l9-6-9-6z" />
              </svg>
            )}
          </Button>
          <Button
            type="button"
            variant="none"
            size="s"
            className="bg-background-subtle hover:bg-background-page flex size-10 items-center justify-center rounded-full p-0"
            onClick={() => seekTo(currentTime + SKIP_SECONDS)}
            aria-label="+10s"
          >
            <ArrowRight className="fill-icon-primary size-4" />
          </Button>
        </div>

        <div
          className={
            isFullscreen
              ? 'absolute right-4 flex items-center gap-2'
              : 'absolute right-0 flex items-center gap-2'
          }
        >
          <SoundTwo className="fill-icon-secondary size-4" />
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(value) => setVolume(value[0] ?? 0)}
            className="h-6 w-24"
            rangeClassName="bg-action-primary-background-default"
            thumbClassName="border-action-primary-background-default"
          />
        </div>
      </div>
    </div>
  );
};
