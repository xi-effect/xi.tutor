import { BaseBoxShapeUtil, HTMLContainer, TLResizeInfo, resizeBox } from 'tldraw';
import {
  FILE_MIN_WIDTH,
  FILE_SHAPE_HEIGHT,
  FILE_SHAPE_WIDTH,
  FileShape,
  fileShapeProps,
} from './FileShape';
import { FileBadge } from './FileBadge';

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

  override onResize(shape: FileShape, info: TLResizeInfo<FileShape>) {
    const next = resizeBox(shape, info, {
      minWidth: FILE_MIN_WIDTH,
      minHeight: FILE_SHAPE_HEIGHT,
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

  override indicator(shape: FileShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={12} ry={12} />;
  }
}
