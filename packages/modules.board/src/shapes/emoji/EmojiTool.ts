import { StateNode, createShapeId, VecLike } from '@ibodr/draw';
import { isAllowedEmoji } from '../../utils/allowedEmojis';
import { EmojiStyle } from '../shapeStyles';

export class EmojiTool extends StateNode {
  static override id = 'emoji';
  static override initial = 'idle';

  private startPoint: VecLike | null = null;

  override onPointerDown() {
    this.startPoint = {
      x: this.editor.inputs.currentPagePoint.x,
      y: this.editor.inputs.currentPagePoint.y,
    };
    const size = 80;
    const nextEmoji = this.editor.getStyleForNextShape(EmojiStyle);
    const emoji = isAllowedEmoji(nextEmoji) ? nextEmoji : '😀';
    const id = createShapeId();

    this.editor.createShape({
      id,
      type: 'emoji',
      x: this.startPoint.x - size / 2,
      y: this.startPoint.y - size / 2,
      props: {
        emoji,
      },
    });

    this.editor.setSelectedShapes([id]);
    this.editor.setCurrentTool('select');
  }
}
