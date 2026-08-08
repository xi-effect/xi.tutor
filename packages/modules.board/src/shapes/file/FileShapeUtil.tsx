import { BaseBoxShapeUtil, HTMLContainer, DrResizeInfo, resizeBox } from '@ibodr/draw';
import {
  FILE_MIN_WIDTH,
  FILE_SHAPE_HEIGHT,
  FILE_SHAPE_WIDTH,
  FileShape,
  fileShapeProps,
} from './FileShape';
import { FileBadge } from './FileBadge';
import { formatFileSize } from '../audio/utils/format';
import { SVG_CARD, truncateForSvg } from '../../utils/shapeSvgExport';

export class FileShapeUtil extends BaseBoxShapeUtil<FileShape> {
  static override type = 'file' as const;
  static override props = fileShapeProps;

  override getDefaultProps(): FileShape['props'] {
    return {
      src: '',
      fileName: '',
      fileSize: 0,
      w: FILE_SHAPE_WIDTH,
      h: FILE_SHAPE_HEIGHT,
      status: 'loading',
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

  override onResize(shape: FileShape, info: DrResizeInfo<FileShape>) {
    const next = resizeBox(shape, info, {
      minWidth: FILE_MIN_WIDTH,
      minHeight: FILE_SHAPE_HEIGHT,
      maxHeight: FILE_SHAPE_HEIGHT,
    });
    return {
      ...next,
      props: { ...next.props },
    };
  }

  override component(shape: FileShape) {
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          overflow: 'hidden',
        }}
      >
        <FileBadge shape={shape} />
      </HTMLContainer>
    );
  }

  override toSvg(shape: FileShape) {
    const { w, h, fileName, fileSize, status } = shape.props;
    const name = truncateForSvg(fileName || 'file', Math.max(12, Math.floor(w / 11)));
    const sizeLabel =
      status === 'uploaded' && fileSize > 0
        ? formatFileSize(fileSize)
        : status === 'loading'
          ? '…'
          : '';

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
        <path
          d="M12 3v12m0 0l-4-4m4 4l4-4"
          transform="translate(18, 28)"
          fill="none"
          stroke={SVG_CARD.icon}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x={20}
          y={24}
          width={28}
          height={32}
          rx={4}
          fill="none"
          stroke={SVG_CARD.icon}
          strokeWidth={2}
        />
        <text
          x={56}
          y={h / 2 - 4}
          fill={SVG_CARD.text}
          fontSize={14}
          fontFamily="system-ui, sans-serif"
          fontWeight={500}
        >
          {name}
        </text>
        {sizeLabel && (
          <text
            x={56}
            y={h / 2 + 16}
            fill={SVG_CARD.muted}
            fontSize={12}
            fontFamily="system-ui, sans-serif"
          >
            {sizeLabel}
          </text>
        )}
      </g>
    );
  }

  override getIndicatorPath(shape: FileShape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
