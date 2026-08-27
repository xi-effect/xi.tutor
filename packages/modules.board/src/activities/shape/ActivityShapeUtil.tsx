import { BaseBoxShapeUtil, DrResizeInfo, resizeBox } from '@ibodr/draw';
import {
  ACTIVITY_MIN_SIZE,
  activityShapeProps,
  getActivityDefaultProps,
  type ActivityShape,
} from './ActivityShape';
import { ActivityComponent } from '../ui/ActivityComponent';
import { SVG_CARD, truncateForSvg } from '../../utils/shapeSvgExport';

export class ActivityShapeUtil extends BaseBoxShapeUtil<ActivityShape> {
  static override type = 'activity' as const;
  static override props = activityShapeProps;

  override getDefaultProps(): ActivityShape['props'] {
    return getActivityDefaultProps('gap-text');
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

  override onResize(shape: ActivityShape, info: DrResizeInfo<ActivityShape>) {
    return resizeBox(shape, info, {
      minWidth: ACTIVITY_MIN_SIZE.w,
      minHeight: ACTIVITY_MIN_SIZE.h,
    });
  }

  override component(shape: ActivityShape) {
    return <ActivityComponent shape={shape} />;
  }

  override toSvg(shape: ActivityShape) {
    const title = (shape.props.title ?? '').trim() || shape.props.kind;
    return (
      <svg width={shape.props.w} height={shape.props.h} xmlns="http://www.w3.org/2000/svg">
        <rect
          x="0.5"
          y="0.5"
          width={shape.props.w - 1}
          height={shape.props.h - 1}
          rx="12"
          fill={SVG_CARD.bg}
          stroke={SVG_CARD.border}
        />
        <text x="16" y="28" fill={SVG_CARD.text} fontSize="14" fontFamily="sans-serif">
          {truncateForSvg(title, 40)}
        </text>
      </svg>
    );
  }

  override getIndicatorPath(shape: ActivityShape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
