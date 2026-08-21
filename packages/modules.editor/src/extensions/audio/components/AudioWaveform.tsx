import { BAR_MIN_HEIGHT, stopEvent, WAVEFORM_HEIGHT } from '../constants';

type AudioWaveformProps = {
  waveform: number[];
  progress: number;
  canControl: boolean;
  onSeek: (e: React.PointerEvent<SVGSVGElement>) => void;
};

export function AudioWaveform({ waveform, progress, canControl, onSeek }: AudioWaveformProps) {
  return (
    <svg
      style={{ cursor: canControl ? 'pointer' : 'default', pointerEvents: 'all' }}
      data-audio-control=""
      className="w-full"
      height={WAVEFORM_HEIGHT}
      preserveAspectRatio="none"
      onPointerDown={(e) => {
        e.preventDefault();
        stopEvent(e);
        if (!canControl) return;
        onSeek(e);
      }}
    >
      <rect width="100%" height="100%" fill="transparent" />
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
  );
}
