import { expect, it } from 'vitest';
import {
  fitPdfShapeBounds,
  pdfBoundsFitKey,
  pdfFrameMetrics,
  pdfPageStackAspect,
  pdfResizeAnchorShift,
  resizePdfFrame,
  samePdfPageBoxes,
} from '../fitPdfShapeBounds';

const a4 = { width: 595, height: 842 };

it('stretches the shape height so a portrait page fills the width', () => {
  const next = fitPdfShapeBounds({
    width: 400,
    height: 200,
    pages: [a4],
    controlsHeight: 40,
  });

  expect(next).toEqual({ w: 400, h: Math.round(400 * (842 / 595) + 40) });
});

it('shrinks a wide frame around a portrait page instead of leaving side gaps', () => {
  const next = fitPdfShapeBounds({
    width: 800,
    height: 400,
    pages: [a4],
    controlsHeight: 36,
  });

  expect(next?.w).toBe(800);
  expect(next?.h).toBeGreaterThan(800);
});

it('stacks every visible page and leaves an already fitted shape alone', () => {
  const pages = [a4, a4];
  const fitted = fitPdfShapeBounds({
    width: 520,
    height: 100,
    pages,
    controlsHeight: 36,
  });
  expect(fitted?.h).toBe(Math.round(520 * pdfPageStackAspect(pages) + 36));

  expect(
    fitPdfShapeBounds({
      width: 520,
      height: fitted!.h,
      pages,
      controlsHeight: 36,
    }),
  ).toBeNull();
});

it('treats equal page sizes as the same measurement', () => {
  const pages = [a4];
  expect(samePdfPageBoxes(pages, [{ width: 595, height: 842 }])).toBe(true);
  expect(samePdfPageBoxes(pages, [a4, a4])).toBe(false);
});

it('keeps the page flush to the frame when the width changes', () => {
  const aspect = 842 / 595;
  const grown = resizePdfFrame({
    nextWidth: 600,
    aspect,
    controlsHeight: 40,
    minSize: 520,
    maxSize: 1024,
  });

  expect(grown.w).toBe(600);
  expect(grown.h).toBe(Math.round(600 * aspect + 40));
});

it('shrinks the width instead of clipping the page when the frame hits the max', () => {
  const next = resizePdfFrame({
    nextWidth: 900,
    aspect: 2,
    controlsHeight: 40,
    minSize: 100,
    maxSize: 1024,
  });

  expect(next.h).toBeLessThanOrEqual(1024);
  expect(next.h).toBe(Math.round(next.w * 2 + 40));
});

it('holds the opposite edge when the corrected height is shorter', () => {
  expect(pdfResizeAnchorShift('bottom_right', 0, 20, 0)).toEqual({ x: 0, y: 0 });
  expect(pdfResizeAnchorShift('top', 0, 20, 0)).toEqual({ x: 0, y: 20 });
  expect(pdfResizeAnchorShift('left', 0, 20, 0)).toEqual({ x: 0, y: 10 });
});

it('reads the saved controls height separately from the page aspect', () => {
  expect(pdfFrameMetrics({ w: 600, h: 900, boundsFit: '1.5000', controlsHeight: 36 })).toEqual({
    aspect: 1.5,
    controlsHeight: 36,
  });
  expect(pdfFrameMetrics({ w: 400, h: 400, boundsFit: '' })).toBeNull();
});

it('builds a stable key from the page proportions', () => {
  expect(pdfBoundsFitKey([a4])).toBe(pdfBoundsFitKey([{ width: 5950, height: 8420 }]));
  expect(pdfBoundsFitKey([a4, a4])).not.toBe(pdfBoundsFitKey([a4]));
  expect(pdfPageStackAspect([])).toBe(0);
  expect(fitPdfShapeBounds({ width: 400, height: 400, pages: [], controlsHeight: 36 })).toBeNull();
});
