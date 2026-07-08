import { StateNode, createShapeId, VecLike } from '@ibodr/draw';
import { EmojiStickerStyle } from '../shapeStyles';

export class EmojiStickerTool extends StateNode {
  static override id = 'emoji-sticker';
  static override initial = 'idle';
  private startPoint: VecLike | null = null;
  override onPointerDown() {
    this.startPoint = {
      x: this.editor.inputs.currentPagePoint.x,
      y: this.editor.inputs.currentPagePoint.y,
    };
    const size = 120;
    const src = this.editor.getStyleForNextShape(EmojiStickerStyle);
    const id = createShapeId();

    this.editor.createShape({
      id,
      type: 'emoji-sticker',
      x: this.startPoint.x - size / 2,
      y: this.startPoint.y - size / 2,
      props: { src },
    });
    this.editor.setSelectedShapes([id]);
    this.editor.setCurrentTool('select');
  }
}
