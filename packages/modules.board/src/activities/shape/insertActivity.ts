import { createShapeId, type Editor } from '@ibodr/draw';
import { type ActivityKind } from '../model/kinds';
import { getActivityDefaultProps } from './ActivityShape';
import { useActivityEditStore } from '../store/activityEditStore';

function getViewportCenter(editor: Editor): { x: number; y: number } {
  const bounds = editor.getViewportPageBounds();
  return {
    x: bounds.x + bounds.w / 2,
    y: bounds.y + bounds.h / 2,
  };
}

export function insertActivity(editor: Editor, kind: ActivityKind): string {
  const props = getActivityDefaultProps(kind);
  const center = getViewportCenter(editor);
  const id = createShapeId();

  editor.markHistoryStoppingPoint('insert-activity');
  editor.createShape({
    id,
    type: 'activity',
    x: center.x - props.w / 2,
    y: center.y - props.h / 2,
    props,
  });
  editor.setSelectedShapes([id]);
  editor.setCurrentTool('select');
  useActivityEditStore.getState().setEditing(id, true);
  return id;
}
