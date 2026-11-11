import { beforeEach, afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  release: vi.fn(),
  retain: vi.fn(),
  render: vi.fn(),
  fit: vi.fn(),
}));
vi.mock('../pdfDocCache', () => ({ pdfDocCache: { get: mocks.get, release: mocks.release } }));
vi.mock('../../../utils/resolveAssetUrl', () => ({ retainBlobUrl: mocks.retain }));
vi.mock('../../../utils/deviceBudget', () => ({ isMemoryConstrainedDevice: () => true }));
vi.mock('../fitPdfPage', () => ({ fitPdfPagePixels: mocks.fit }));
let canvases: Array<{ width: number; height: number }>;
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  canvases = [];
  mocks.retain.mockImplementation(() => vi.fn());
  mocks.fit.mockReturnValue({ pixelWidth: 100, pixelHeight: 100, scale: 1 });
  mocks.render.mockImplementation(() => ({ promise: Promise.resolve(), cancel: vi.fn() }));
  mocks.get.mockResolvedValue({
    getPage: async () => ({
      getViewport: () => ({ width: 100, height: 100 }),
      render: mocks.render,
      cleanup: vi.fn(),
    }),
  });
  vi.stubGlobal('document', {
    createElement: () => {
      const canvas = {
        width: 0,
        height: 0,
        getContext: () => ({}),
        toBlob: (cb: (blob: Blob) => void) => cb(new Blob(['image'])),
      };
      canvases.push(canvas);
      return canvas;
    },
  });
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:page');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const request = { source: 'blob:document', page: 1, width: 400, height: 600, zoom: 1, dpr: 1 };
it('shares rendering and cached images between consumers; releases temporary canvases', async () => {
  const { acquirePdfPageImage } = await import('../pdfPageImages');
  const a = acquirePdfPageImage(request),
    b = acquirePdfPageImage(request);
  expect(await a.promise).toBe(await b.promise);
  expect(mocks.render).toHaveBeenCalledTimes(1);
  a.release();
  b.release();
  const c = acquirePdfPageImage(request);
  await c.promise;
  c.release();
  expect(mocks.render).toHaveBeenCalledTimes(1);
  expect(canvases[0]).toMatchObject({ width: 0, height: 0 });
  expect(mocks.release).toHaveBeenCalledTimes(1);
});
it('skips released queued requests and continues after a failure', async () => {
  const { acquirePdfPageImage } = await import('../pdfPageImages');
  const a = acquirePdfPageImage(request);
  a.release();
  await expect(a.promise).rejects.toMatchObject({ name: 'AbortError' });
  expect(mocks.get).not.toHaveBeenCalled();
  mocks.get.mockRejectedValueOnce(new Error('broken document'));
  const b = acquirePdfPageImage(request);
  await expect(b.promise).rejects.toThrow('broken document');
  b.release();
  const c = acquirePdfPageImage(request);
  await c.promise;
  c.release();
  expect(mocks.render).toHaveBeenCalledTimes(1);
});
it('serializes distinct pages and cancels only after the last consumer leaves', async () => {
  const { acquirePdfPageImage } = await import('../pdfPageImages');
  let finish!: () => void;
  const cancel = vi.fn(() => finish());
  mocks.render.mockImplementationOnce(() => ({
    promise: new Promise<void>((resolve) => {
      finish = resolve;
    }),
    cancel,
  }));
  const a = acquirePdfPageImage(request),
    shared = acquirePdfPageImage(request);
  const b = acquirePdfPageImage({ ...request, page: 2 });
  await vi.waitFor(() => expect(mocks.render).toHaveBeenCalledTimes(1));
  a.release();
  expect(cancel).not.toHaveBeenCalled();
  shared.release();
  expect(cancel).toHaveBeenCalledTimes(1);
  await expect(a.promise).rejects.toMatchObject({ name: 'AbortError' });
  await b.promise;
  b.release();
  expect(mocks.render).toHaveBeenCalledTimes(2);
});
it('evicts oversized images only after consumers release them', async () => {
  const { acquirePdfPageImage } = await import('../pdfPageImages');
  mocks.fit.mockReturnValue({ pixelWidth: 4000, pixelHeight: 4000, scale: 1 });
  const a = acquirePdfPageImage(request);
  await a.promise;
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  a.release();
  a.release();
  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  const b = acquirePdfPageImage(request);
  await b.promise;
  b.release();
  expect(mocks.render).toHaveBeenCalledTimes(2);
});
