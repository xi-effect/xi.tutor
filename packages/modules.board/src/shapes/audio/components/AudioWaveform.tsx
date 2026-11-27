import { useRef } from 'react';
import { BAR_MIN_HEIGHT, stopEvent, WAVEFORM_HEIGHT } from '../constants';
import { timeFromPointer } from '../utils/syncPlayback';

type AudioWaveformProps = {
  waveform: number[];
  progress: number;
  duration: number;
  canControl: boolean;
  isInteractive: boolean;
  onSeek: (time: number, phase: 'drag' | 'commit') => void;
};

export function AudioWaveform({
  waveform,
  progress,
  duration,
  canControl,
  isInteractive,
  onSeek,
}: AudioWaveformProps) {
  const draggingRef = useRef(false);
  const interactive = isInteractive && canControl && duration > 0;

  const timeAt = (clientX: number, element: HTMLDivElement) =>
    timeFromPointer(clientX, element.getBoundingClientRect(), duration);

  return (
    <div
      data-audio-control=""
      data-audio-action="seek"
      style={{
        pointerEvents: interactive ? 'auto' : 'none',
        touchAction: 'none',
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
        cursor: interactive ? 'pointer' : 'default',
      }}
      onPointerDown={
        interactive
          ? (event) => {
              event.preventDefault();
              stopEvent(event);
              draggingRef.current = true;
              try {
                event.currentTarget.setPointerCapture(event.pointerId);
              } catch {
                /* жест уже у канвы */
              }
              onSeek(timeAt(event.clientX, event.currentTarget), 'drag');
            }
          : undefined
      }
      onPointerMove={
        interactive
          ? (event) => {
              if (!draggingRef.current) return;
              stopEvent(event);
              onSeek(timeAt(event.clientX, event.currentTarget), 'drag');
            }
          : undefined
      }
      onPointerUp={
        interactive
          ? (event) => {
              if (!draggingRef.current) return;
              draggingRef.current = false;
              stopEvent(event);
              onSeek(timeAt(event.clientX, event.currentTarget), 'commit');
            }
          : undefined
      }
      onPointerCancel={
        interactive
          ? (event) => {
              if (!draggingRef.current) return;
              draggingRef.current = false;
              stopEvent(event);
              onSeek(timeAt(event.clientX, event.currentTarget), 'commit');
            }
          : undefined
      }
    >
      <svg
        className="w-full"
        height={WAVEFORM_HEIGHT}
        preserveAspectRatio="none"
        style={{ pointerEvents: 'none', display: 'block' }}
      >
        {waveform.map((amp, i) => {
          const count = waveform.length;
          const barW = 100 / count;
          const gapRatio = 0.3;
          const barHeight = Math.max(BAR_MIN_HEIGHT, amp * (WAVEFORM_HEIGHT - 4));
          const played = (i + 0.5) / count <= progress;

          return (
            <rect
              key={i}
              x={`${i * barW + (barW * gapRatio) / 2}%`}
              y={(WAVEFORM_HEIGHT - barHeight) / 2}
              width={`${barW * (1 - gapRatio)}%`}
              height={barHeight}
              rx={1.5}
              className={played ? 'fill-icon-brand' : 'fill-icon-disabled'}
            />
          );
        })}
      </svg>
    </div>
  );
}
