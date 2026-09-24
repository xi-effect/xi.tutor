import { createElement } from 'react';
import { NoteShapeUtil, type DrNoteShape } from '@ibodr/draw';
import { StickerShapeComponent } from './StickerShapeComponent';
import { applyStickerFontMetrics } from './stickerTextStyle';

const BaseNoteShapeUtil = NoteShapeUtil.configure({
  resizeMode: 'scale',
});

export class StickerShapeUtil extends BaseNoteShapeUtil {
  override component(shape: DrNoteShape) {
    return createElement(StickerShapeComponent, { util: this, shape });
  }

  override onBeforeCreate(next: DrNoteShape) {
    const created = (super.onBeforeCreate(next) ?? next) as DrNoteShape;
    return (applyStickerFontMetrics(this.editor, created) ?? created) as ReturnType<
      NoteShapeUtil['onBeforeCreate']
    >;
  }

  override onBeforeUpdate(prev: DrNoteShape, next: DrNoteShape) {
    const fromSuper = super.onBeforeUpdate(prev, next) as DrNoteShape | undefined;
    const base = (fromSuper ?? next) as DrNoteShape;
    const fitted = applyStickerFontMetrics(this.editor, base);
    return (fitted ?? fromSuper) as ReturnType<NoteShapeUtil['onBeforeUpdate']>;
  }
}
