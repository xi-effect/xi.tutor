import {
  createShapeId,
  DefaultColorStyle,
  DefaultFontStyle,
  DefaultSizeStyle,
  toRichText,
  type DrShape,
  type DrShapeId,
  type Editor,
} from '@ibodr/draw';
import { getOcrTextPagePoint, getOcrTextWidth } from './ocrTextPlacement';

type OcrSourceShape = {
  id: DrShapeId;
  parentId: DrShape['parentId'];
  props: { w: number };
};

/** Создаёт обычный text-элемент справа от исходной фигуры через editor.createShape. */
export function insertOcrTextShape(editor: Editor, source: OcrSourceShape, text: string): string {
  const bounds = editor.getShapePageBounds(source.id);
  if (!bounds) {
    throw new Error('Shape bounds are unavailable');
  }

  const pagePoint = getOcrTextPagePoint(bounds);
  const point = editor.getPointInParentSpace(source.id, pagePoint);
  const id = createShapeId();
  const defaults = editor.getShapeUtil('text').getDefaultProps();

  editor.markHistoryStoppingPoint('recognize-printed-text');
  editor.run(() => {
    editor.createShape({
      id,
      type: 'text',
      x: point.x,
      y: point.y,
      parentId: source.parentId,
      props: {
        ...defaults,
        richText: toRichText(text),
        autoSize: false,
        w: getOcrTextWidth(source.props.w),
        color: editor.getStyleForNextShape(DefaultColorStyle),
        size: editor.getStyleForNextShape(DefaultSizeStyle),
        font: editor.getStyleForNextShape(DefaultFontStyle),
      },
    });
    editor.setSelectedShapes([id]);
    editor.setCurrentTool('select');
  });

  return id;
}
