import { BaseBoxShapeUtil, HTMLContainer, DrResizeInfo, resizeBox } from '@ibodr/draw';

import { PresentationShape, presentationShapeProps } from './PresentationShape';

import { PresentationViewer } from './PresentationViewer';
import { PRESENTATION_MAX_SIZE, PRESENTATION_MIN_SIZE } from './consts';

export class PresentationShapeUtil extends BaseBoxShapeUtil<PresentationShape> {
  static override props = presentationShapeProps;
  static override type = 'presentation' as const;

  override getDefaultProps(): PresentationShape['props'] {
    return {
      src: '',
      fileName: '',
      totalSlides: 0,
      currentSlide: 1,
      w: 400,
      h: 225,
      studentCanFlip: true,
    };
  }

  override canEdit() {
    return false;
  }

  override canResize() {
    return true;
  }

  override isAspectRatioLocked() {
    return true;
  }

  override onResize(shape: PresentationShape, info: DrResizeInfo<PresentationShape>) {
    const aspectRatio = shape.props.w / shape.props.h;

    return resizeBox(shape, info, {
      minWidth: PRESENTATION_MIN_SIZE,
      minHeight: PRESENTATION_MIN_SIZE / aspectRatio,
      maxWidth: PRESENTATION_MAX_SIZE,
      maxHeight: PRESENTATION_MAX_SIZE / aspectRatio,
    });
  }

  override component(shape: PresentationShape) {
    return (
      <HTMLContainer
        className="bg-gray-5 border-gray-10 overflow-hidden rounded-xl border shadow-md"
        style={{
          width: shape.props.w,
          height: shape.props.h,
        }}
      >
        <PresentationViewer shape={shape} />
      </HTMLContainer>
    );
  }

  override getIndicatorPath(shape: PresentationShape) {
    const path = new Path2D();

    path.rect(0, 0, shape.props.w, shape.props.h);

    return path;
  }
}
