import { BaseBoxShapeUtil, HTMLContainer, DrResizeInfo, resizeBox } from '@ibodr/draw';
import {
  AUDIO_MIN_WIDTH,
  AUDIO_SHAPE_HEIGHT,
  AUDIO_SHAPE_WIDTH,
  audioShapeProps,
  computeAudioShapeHeight,
} from './AudioShape';
import { AudioPlayer } from './AudioPlayer';
import type { AudioShape } from './AudioShape';
import { formatFileSize, formatTime } from './utils/format';
import { SVG_CARD, truncateForSvg } from '../../utils/shapeSvgExport';

export class AudioShapeUtil extends BaseBoxShapeUtil<AudioShape> {
  static override type = 'audio' as const;
  static override props = audioShapeProps;

  override getDefaultProps(): AudioShape['props'] {
    return {
      src: '',
      fileName: '',
      fileSize: 0,
      duration: 0,
      w: AUDIO_SHAPE_WIDTH,
      h: AUDIO_SHAPE_HEIGHT,
      syncPlayback: false,
      studentsCanAddTimecodes: false,
      timecodesVisibleByDefault: true,
      studentsCanControlPlayback: false,
      timecodes: [],
    };
  }

  override canEdit() {
    return false;
  }

  override canResize() {
    return true;
  }

  override isAspectRatioLocked() {
    return false;
  }

  override onResize(shape: AudioShape, info: DrResizeInfo<AudioShape>) {
    const h = computeAudioShapeHeight(shape.props.timecodes.length);
    const next = resizeBox(shape, info, {
      minWidth: AUDIO_MIN_WIDTH,
      minHeight: h,
    });
    return {
      ...next,
      props: { ...next.props, h },
    };
  }

  override component(shape: AudioShape) {
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          overflow: 'hidden',
        }}
      >
        <AudioPlayer shape={shape} />
      </HTMLContainer>
    );
  }

  override toSvg(shape: AudioShape) {
    const { w, h, fileName, fileSize, duration } = shape.props;
    const title = truncateForSvg(fileName || 'Audio', Math.max(10, Math.floor((w - 72) / 9)));
    const meta = [
      duration > 0 ? formatTime(duration) : null,
      fileSize > 0 ? formatFileSize(fileSize) : null,
    ]
      .filter(Boolean)
      .join(', ');

    // Декоративный waveform — реальный live-waveform в SVG-экспорт не сериализуется.
    const barCount = Math.max(24, Math.min(64, Math.floor((w - 72) / 6)));
    const bars = Array.from({ length: barCount }, (_, i) => {
      const t = i / Math.max(1, barCount - 1);
      const amp = 0.35 + 0.55 * Math.abs(Math.sin(t * Math.PI * 3.2 + 0.4));
      return amp;
    });
    const waveX = 56;
    const waveW = w - 72;
    const waveY = 18;
    const waveH = 28;

    return (
      <g>
        <rect
          width={w}
          height={h}
          rx={12}
          ry={12}
          fill={SVG_CARD.bg}
          stroke={SVG_CARD.border}
          strokeWidth={1}
        />
        <circle cx={28} cy={40} r={14} fill={SVG_CARD.accent} />
        <polygon points="24,32 24,48 36,40" fill="#ffffff" />
        {bars.map((amp, i) => {
          const barW = waveW / barCount;
          const gap = barW * 0.3;
          const barH = Math.max(3, amp * (waveH - 4));
          return (
            <rect
              key={i}
              x={waveX + i * barW + gap / 2}
              y={waveY + (waveH - barH) / 2}
              width={Math.max(1, barW - gap)}
              height={barH}
              rx={1}
              fill={i / barCount < 0.01 ? SVG_CARD.accent : '#d4d4d8'}
            />
          );
        })}
        <text
          x={waveX}
          y={62}
          fill={SVG_CARD.muted}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
        >
          {meta || title}
        </text>
      </g>
    );
  }

  override getIndicatorPath(shape: AudioShape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
