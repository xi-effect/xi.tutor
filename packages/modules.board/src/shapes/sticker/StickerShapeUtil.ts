import { createElement } from 'react';
import { NoteShapeUtil, type DrNoteShape } from '@ibodr/draw';
import { StickerShapeComponent } from './StickerShapeComponent';

const BaseNoteShapeUtil = NoteShapeUtil.configure({
  resizeMode: 'scale',
});

export class StickerShapeUtil extends BaseNoteShapeUtil {
  override component(shape: DrNoteShape) {
    return createElement(StickerShapeComponent, { util: this, shape });
  }
}
