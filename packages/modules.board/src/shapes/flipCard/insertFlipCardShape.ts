import { createShapeId, type Editor } from '@ibodr/draw';
import { FlipCardFrontColorStyle, FlipCardBackColorStyle } from '../shapeStyles';
import { startLabelEditing } from '../labels/startLabelEditing';
import { BASE_CARD_HEIGHT, BASE_CARD_WIDTH, EMPTY_RICH_TEXT } from './consts';

function getViewportCenter(editor: Editor): { x: number; y: number } {
  const bounds = editor.getViewportPageBounds();
  return {
    x: bounds.x + bounds.w / 2,
    y: bounds.y + bounds.h / 2,
  };
}

export function insertFlipCardShape(editor: Editor): string {
  const center = getViewportCenter(editor);
  const id = createShapeId();

  editor.markHistoryStoppingPoint('insert-flip-card');

  editor.createShape({
    id,
    type: 'flip-card',
    x: center.x - BASE_CARD_WIDTH / 2,
    y: center.y - BASE_CARD_HEIGHT / 2,
    props: {
      w: BASE_CARD_WIDTH,
      h: BASE_CARD_HEIGHT,
      richText: EMPTY_RICH_TEXT,
      frontRichText: EMPTY_RICH_TEXT,
      backRichText: EMPTY_RICH_TEXT,
      isFlipped: false,
      frontColor: FlipCardFrontColorStyle.defaultValue,
      backColor: FlipCardBackColorStyle.defaultValue,
      size: 'm',
    },
  });

  editor.setSelectedShapes([id]);
  editor.setCurrentTool('select');
  startLabelEditing(editor, id);

  return id;
}
