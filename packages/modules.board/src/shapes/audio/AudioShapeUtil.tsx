import { BaseBoxShapeUtil, HTMLContainer, TLResizeInfo, resizeBox } from 'tldraw';
import {
  AUDIO_MIN_WIDTH,
  AUDIO_SHAPE_HEIGHT,
  AUDIO_SHAPE_WIDTH,
  audioShapeProps,
  computeAudioShapeHeight,
} from './AudioShape';
import { AudioPlayer } from './AudioPlayer';
import type { AudioShape } from './AudioShape';

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

  override onResize(shape: AudioShape, info: TLResizeInfo<AudioShape>) {
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

  override indicator(shape: AudioShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={12} ry={12} />;
  }
}
