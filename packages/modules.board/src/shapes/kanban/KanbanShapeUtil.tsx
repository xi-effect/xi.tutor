import { BaseBoxShapeUtil, HTMLContainer, DrResizeInfo, resizeBox } from '@ibodr/draw';
import {
  KANBAN_MIN_HEIGHT,
  KANBAN_MIN_WIDTH,
  KanbanShape,
  kanbanShapeProps,
  createDefaultColumns,
  KANBAN_DEFAULT_HEIGHT,
  KANBAN_DEFAULT_WIDTH,
} from './KanbanShape';
import { KanbanBoard } from './KanbanBoard';

export class KanbanShapeUtil extends BaseBoxShapeUtil<KanbanShape> {
  static override type = 'kanban' as const;
  static override props = kanbanShapeProps;

  override getDefaultProps(): KanbanShape['props'] {
    return {
      w: KANBAN_DEFAULT_WIDTH,
      h: KANBAN_DEFAULT_HEIGHT,
      columns: createDefaultColumns(),
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

  override onResize(shape: KanbanShape, info: DrResizeInfo<KanbanShape>) {
    return resizeBox(shape, info, {
      minWidth: KANBAN_MIN_WIDTH,
      minHeight: KANBAN_MIN_HEIGHT,
    });
  }

  override component(shape: KanbanShape) {
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <KanbanBoard shape={shape} />
      </HTMLContainer>
    );
  }

  override getIndicatorPath(shape: KanbanShape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
