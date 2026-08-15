import { createShapeId, DefaultColorStyle, DefaultSizeStyle, StateNode } from '@ibodr/draw';
import { BASE_CARD_HEIGHT, BASE_CARD_WIDTH, EMPTY_RICH_TEXT } from './FlipCardShape';
import { startLabelEditing } from '../labels/startLabelEditing';

export class FlipCardTool extends StateNode {
  static override id = 'flip-card';

  override onEnter() {
    this.editor.setCursor({ type: 'cross', rotation: 0 });
  }

  override onPointerDown() {
    const { x, y } = this.editor.inputs.currentPagePoint;
    const color = this.editor.getStyleForNextShape(DefaultColorStyle);
    const size = this.editor.getStyleForNextShape(DefaultSizeStyle);
    const id = createShapeId();

    this.editor.createShape({
      id,
      type: 'flip-card',
      x: x - BASE_CARD_WIDTH / 2,
      y: y - BASE_CARD_HEIGHT / 2,
      props: {
        w: BASE_CARD_WIDTH,
        h: BASE_CARD_HEIGHT,
        richText: EMPTY_RICH_TEXT,
        frontRichText: EMPTY_RICH_TEXT,
        backRichText: EMPTY_RICH_TEXT,
        isFlipped: false,
        color,
        size,
      },
    });

    this.editor.setCurrentTool('select');
    this.editor.setSelectedShapes([id]);
    startLabelEditing(this.editor, id);
  }

  override onCancel() {
    this.editor.setCurrentTool('select');
  }
}
