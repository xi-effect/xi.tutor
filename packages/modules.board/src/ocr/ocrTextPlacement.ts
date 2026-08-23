export const OCR_TEXT_GAP = 16;

export function getOcrTextPagePoint(
  imageBounds: { maxX: number; minY: number },
  gap = OCR_TEXT_GAP,
): { x: number; y: number } {
  return { x: imageBounds.maxX + gap, y: imageBounds.minY };
}

export function getOcrTextWidth(imageWidth: number): number {
  return Math.max(200, Math.min(imageWidth, 480));
}
