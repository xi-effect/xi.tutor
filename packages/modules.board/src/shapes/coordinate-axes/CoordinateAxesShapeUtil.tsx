import { BaseBoxShapeUtil, DrResizeInfo, resizeBox } from '@ibodr/draw';
import {
  COORDINATE_AXES_DEFAULT_HEIGHT,
  COORDINATE_AXES_DEFAULT_WIDTH,
  COORDINATE_AXES_MIN_SIZE,
  CoordinateAxesShape,
  coordinateAxesShapeProps,
} from './CoordinateAxesShape';
import { CoordinateAxesComponent } from './CoordinateAxesComponent';

export class CoordinateAxesShapeUtil extends BaseBoxShapeUtil<CoordinateAxesShape> {
  static override type = 'coordinate-axes' as const;
  static override props = coordinateAxesShapeProps;

  override getDefaultProps(): CoordinateAxesShape['props'] {
    return {
      w: COORDINATE_AXES_DEFAULT_WIDTH,
      h: COORDINATE_AXES_DEFAULT_HEIGHT,
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      xDivisions: 10,
      yDivisions: 10,
      showLabels: true,
      equation: '',
      color: 'black',
      plotColor: 'blue',
      size: 'm',
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

  override onResize(shape: CoordinateAxesShape, info: DrResizeInfo<CoordinateAxesShape>) {
    return resizeBox(shape, info, {
      minWidth: COORDINATE_AXES_MIN_SIZE,
      minHeight: COORDINATE_AXES_MIN_SIZE,
    });
  }

  override component(shape: CoordinateAxesShape) {
    return <CoordinateAxesComponent shape={shape} />;
  }

  override getIndicatorPath(shape: CoordinateAxesShape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
