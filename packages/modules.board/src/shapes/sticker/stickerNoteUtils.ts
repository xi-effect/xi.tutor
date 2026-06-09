import type { DrNoteShape } from '@ibodr/draw';

export function getStickerNoteHeight(shape: DrNoteShape, noteHeight: number): number {
  return (noteHeight + shape.props.growY) * shape.props.scale;
}

/** Упрощённая тень стикера — без rng, достаточно для UI. */
export function getStickerNoteShadow(scale: number, rotation: number): string {
  const oy = Math.cos(rotation);
  const a = 5 * scale;
  const b = 4 * scale;
  const c = 6 * scale;
  const d = 7 * scale;
  const lift = 0.75;
  return `0px ${Math.max(0, a - lift)}px ${a}px -${a}px rgba(15, 23, 31, .6),
    0px ${(b + lift * d) * Math.max(0, oy)}px ${c + lift * d}px -${b + lift * c}px rgba(15, 23, 31, 0.35),
    0px ${48 * scale}px ${10 * scale}px -${10 * scale}px inset rgba(15, 23, 44, 0.02)`;
}
