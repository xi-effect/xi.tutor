import {
  createShapeId,
  DefaultColorStyle,
  DefaultFontStyle,
  DefaultSizeStyle,
  type Editor,
} from '@ibodr/draw';
import { statementToBoardRichText } from 'pages.math-bank/latex';

const TASK_TEXT_WIDTH = 520;

export function insertMathTaskToBoard(editor: Editor, statement: string): string {
  const bounds = editor.getViewportPageBounds();
  const id = createShapeId();
  const defaults = editor.getShapeUtil('text').getDefaultProps();

  editor.markHistoryStoppingPoint('insert-math-bank-task');
  editor.run(() => {
    editor.createShape({
      id,
      type: 'text',
      x: bounds.x + bounds.w / 2 - TASK_TEXT_WIDTH / 2,
      y: bounds.y + bounds.h / 2 - 48,
      props: {
        ...defaults,
        richText: statementToBoardRichText(statement),
        autoSize: false,
        w: TASK_TEXT_WIDTH,
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
