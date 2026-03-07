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
      style={{ pointerEvents: 'all', cursor: canControl ? 'pointer' : 'default' }}
      className="w-full"
      height={WAVEFORM_HEIGHT}
      preserveAspectRatio="none"
      onPointerDown={(e) => {
        stopEvent(e);
        onSeek(e);
      }}
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
            className={played ? 'fill-brand-80' : 'fill-gray-40'}
          />
        );
      })}
    </svg>
  );
}
