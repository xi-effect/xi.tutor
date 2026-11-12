import { afterEach, expect, it, vi } from 'vitest';
import { createPresentationPainter } from '../presentationPainter';
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
const paint = { width: 100, height: 100, pixelWidth: 200, pixelHeight: 200, page: 1 };
it('serializes rendering, skips superseded requests and keeps the visible canvas until commit', async () => {
  vi.useFakeTimers();
  const buffers: Array<{ width: number; height: number }> = [];
  vi.stubGlobal('document', {
    createElement: () => {
      const b = { width: 0, height: 0 };
      buffers.push(b);
      return b;
    },
  });
  const drawImage = vi.fn();
  const target = {
    width: 10,
    height: 10,
    style: {},
    getContext: () => ({ drawImage }),
  } as unknown as HTMLCanvasElement;
  let finish!: () => void;
  const render = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = () => resolve(undefined);
        }),
    )
    .mockResolvedValue(undefined);
  const viewer = { render, destroy: vi.fn() };
  const commit = vi.fn();
  const painter = createPresentationPainter(viewer, target, commit, vi.fn());
  painter.request(paint);
  painter.request({ ...paint, page: 2 });
  painter.request({ ...paint, page: 3 });
  expect(render).toHaveBeenCalledTimes(1);
  expect(target.width).toBe(10);
  finish();
  await vi.advanceTimersByTimeAsync(0);
  expect(render).toHaveBeenCalledTimes(2);
  expect(render.mock.calls[1][1].slideIndex).toBe(2);
  expect(commit.mock.calls).toEqual([[3]]);
  expect(drawImage).toHaveBeenCalledTimes(1);
  painter.request({ ...paint, page: 3 });
  expect(render).toHaveBeenCalledTimes(2);
  expect(buffers.every((b) => b.width === 0 && b.height === 0)).toBe(true);
  painter.dispose();
  await vi.advanceTimersByTimeAsync(300);
  expect(viewer.destroy).toHaveBeenCalledTimes(1);
  expect(render).toHaveBeenCalledTimes(2);
});
it('waits for active rendering before destroying and never commits after disposal', async () => {
  vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0 }) });
  let finish!: () => void;
  const viewer = {
    render: vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = () => resolve(undefined);
        }),
    ),
    destroy: vi.fn(),
  };
  const commit = vi.fn();
  const painter = createPresentationPainter(viewer, {} as HTMLCanvasElement, commit, vi.fn());
  painter.request(paint);
  painter.dispose();
  expect(viewer.destroy).not.toHaveBeenCalled();
  finish();
  await Promise.resolve();
  await Promise.resolve();
  expect(viewer.destroy).toHaveBeenCalledTimes(1);
  expect(commit).not.toHaveBeenCalled();
});
