import { describe, expect, it } from 'vitest';
import type { DrNoteShape } from '@ibodr/draw';
import {
  clampStickerFontSize,
  fitStickerFontSize,
  getStickerAlign,
  getStickerTextAlign,
  getStickerTextLimits,
  readStickerFontSize,
  stickerGrowYForContent,
} from '../stickerTextStyle';

function note(align: DrNoteShape['props']['align'], meta: DrNoteShape['meta'] = {}): DrNoteShape {
  return { props: { align }, meta } as DrNoteShape;
}

describe('getStickerAlign', () => {
  it('читает left, center и right из стиля стикера', () => {
    expect(getStickerAlign(note('start'))).toBe('start');
    expect(getStickerAlign(note('middle'))).toBe('middle');
    expect(getStickerAlign(note('end'))).toBe('end');
    expect(getStickerAlign(note('start-legacy'))).toBe('start');
  });

  it('считает justify из meta, даже если align остался start', () => {
    expect(getStickerAlign(note('start', { stickerTextAlign: 'justify' }))).toBe('justify');
    expect(getStickerTextAlign(note('start', { stickerTextAlign: 'justify' }))).toBe('justify');
    expect(getStickerTextAlign(note('middle'))).toBe('center');
  });
});

describe('clampStickerFontSize', () => {
  it('держит размер в диапазоне 12–48', () => {
    expect(clampStickerFontSize(8)).toBe(12);
    expect(clampStickerFontSize(24.4)).toBe(24);
    expect(clampStickerFontSize(80)).toBe(48);
  });

  it('читает сохранённый размер стикера', () => {
    expect(readStickerFontSize(note('middle', { stickerFontSize: 32 }))).toBe(32);
    expect(readStickerFontSize(note('middle', { stickerFontSize: 4 }))).toBe(12);
    expect(readStickerFontSize(note('middle'))).toBeNull();
  });
});

describe('fitStickerFontSize', () => {
  it('оставляет выбранный размер, если текст влезает', () => {
    expect(
      fitStickerFontSize({
        preferredPx: 24,
        maxContentHeight: 100,
        measure: () => 80,
      }),
    ).toEqual({ px: 24, contentHeight: 80 });
  });

  it('берёт наибольший размер, который ещё влезает', () => {
    expect(
      fitStickerFontSize({
        preferredPx: 20,
        maxContentHeight: 100,
        measure: (px) => px * 6,
      }),
    ).toEqual({ px: 16, contentHeight: 96 });
  });

  it('не опускается ниже 12, даже если текст всё равно выше стикера', () => {
    expect(
      fitStickerFontSize({
        preferredPx: 24,
        maxContentHeight: 100,
        measure: (px) => px * 10,
      }).px,
    ).toBe(12);
  });

  it('растит стикер не выше двух ширин', () => {
    expect(getStickerTextLimits(200, 200, 16)).toEqual({
      maxContentHeight: 368,
      maxGrowY: 200,
    });
    expect(stickerGrowYForContent(500, 16, 200, 200)).toBe(200);
    expect(stickerGrowYForContent(180, 16, 200, 200)).toBe(12);
  });
});
