import { beforeEach, describe, expect, it, vi } from 'vitest';

const resolveAssetUrl = vi.fn(async () => 'blob:original');
const getCachedBlobUrl = vi.fn((): string | undefined => undefined);
const rememberBlob = vi.fn(() => 'blob:resized');

vi.mock('../resolveAssetUrl', () => ({
  resolveAssetUrl: (...args: unknown[]) =>
    (resolveAssetUrl as (...a: unknown[]) => unknown)(...args),
  getCachedBlobUrl: (...args: unknown[]) =>
    (getCachedBlobUrl as (...a: unknown[]) => unknown)(...args),
  rememberBlob: (...args: unknown[]) => (rememberBlob as (...a: unknown[]) => unknown)(...args),
}));
vi.mock('../boardProblem', () => ({ reportBoardProblem: vi.fn() }));

const fetchMock = vi.fn();

beforeEach(() => {
  vi.resetModules();
  resolveAssetUrl.mockClear();
  getCachedBlobUrl.mockClear();
  rememberBlob.mockClear();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

describe('resolveDisplayImageUrl', () => {
  it('не качает и не декодирует файл, если по размерам из ассета уменьшать нечего', async () => {
    const { resolveDisplayImageUrl } = await import('../displayImage');
    // maxEdge 1200 → корзина 2048, файл 1600 px целиком в неё влезает
    const url = await resolveDisplayImageUrl('file-1', 'token', 1200, { w: 1600, h: 900 });
    expect(url).toBe('blob:original');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('оригинал для крупной корзины отдаёт сразу', async () => {
    const { resolveDisplayImageUrl } = await import('../displayImage');
    const url = await resolveDisplayImageUrl('file-1', 'token', 3000, { w: 4000, h: 3000 });
    expect(url).toBe('blob:original');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('огромный растр по размерам из ассета не качает и не декодирует', async () => {
    const createImageBitmapMock = vi.fn();
    vi.stubGlobal('createImageBitmap', createImageBitmapMock);
    const { resolveDisplayImageUrl } = await import('../displayImage');
    // 6610 × 13043 ≈ 86 Мп
    const url = await resolveDisplayImageUrl('file-huge', 'token', 900, { w: 6610, h: 13043 });
    expect(url).toBe('blob:original');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(createImageBitmapMock).not.toHaveBeenCalled();
  });

  it('огромный растр по заголовку файла не декодируется, даже если ассет врёт', async () => {
    const createImageBitmapMock = vi.fn();
    vi.stubGlobal('createImageBitmap', createImageBitmapMock);
    vi.stubGlobal('OffscreenCanvas', class {});
    const header = new Uint8Array(33);
    header.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    header.set([0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52], 8);
    new DataView(header.buffer).setUint32(16, 6610);
    new DataView(header.buffer).setUint32(20, 13043);
    fetchMock.mockResolvedValue({
      ok: true,
      blob: async () => new Blob([header], { type: 'image/png' }),
    });
    const { resolveDisplayImageUrl } = await import('../displayImage');

    // ассет утверждает, что файл небольшой (3000×2000), и нужен ресайз
    const url = await resolveDisplayImageUrl('file-liar', 'token', 900, { w: 3000, h: 2000 });
    expect(url).toBe('blob:original');
    expect(createImageBitmapMock).not.toHaveBeenCalled();
  });

  it('считает размер уменьшения по ассету, а не по заголовку: у повёрнутого JPEG они перепутаны', async () => {
    // в файле 3000×2000 (альбомный, EXIF-поворот), в ассете после поворота 2000×3000
    const jpegHeader = new Uint8Array([
      0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x07, 0xd0, 0x0b, 0xb8, 3, 0, 0, 0, 0, 0, 0,
    ]);
    const bitmap = { width: 10, height: 10, close: vi.fn() };
    const createImageBitmapMock = vi.fn().mockResolvedValue(bitmap);
    vi.stubGlobal('createImageBitmap', createImageBitmapMock);
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        getContext() {
          return { drawImage: vi.fn() };
        }
        convertToBlob() {
          return Promise.resolve(new Blob(['x'], { type: 'image/jpeg' }));
        }
      },
    );
    fetchMock.mockResolvedValue({
      ok: true,
      blob: async () => new Blob([jpegHeader, new Uint8Array(500)], { type: 'image/jpeg' }),
    });
    const { resolveDisplayImageUrl } = await import('../displayImage');

    await resolveDisplayImageUrl('file-rot', 'token', 1000, { w: 2000, h: 3000 });

    expect(createImageBitmapMock).toHaveBeenCalledTimes(1);
    const options = createImageBitmapMock.mock.calls[0][1] as {
      resizeWidth: number;
      resizeHeight: number;
    };
    // портретная ориентация: высота больше ширины
    expect(options.resizeHeight).toBeGreaterThan(options.resizeWidth);
  });

  it('помнит неудачный ресайз и не повторяет его на следующем резолве', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('decode failed')));
    vi.stubGlobal('OffscreenCanvas', class {});
    fetchMock.mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['x'], { type: 'image/jpeg' }),
    });
    const { resolveDisplayImageUrl } = await import('../displayImage');

    const first = await resolveDisplayImageUrl('file-2', 'token', 900, { w: 3000, h: 2000 });
    const second = await resolveDisplayImageUrl('file-2', 'token', 900, { w: 3000, h: 2000 });

    expect(first).toBe('blob:original');
    expect(second).toBe('blob:original');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('не создаёт blob, если уменьшенная копия получилась не меньше оригинала', async () => {
    const bitmap = { width: 10, height: 10, close: vi.fn() };
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap));
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        getContext() {
          return { drawImage: vi.fn() };
        }
        convertToBlob() {
          return Promise.resolve(new Blob(['x'.repeat(100)], { type: 'image/png' }));
        }
      },
    );
    fetchMock.mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['x'.repeat(50)], { type: 'image/png' }),
    });
    const { resolveDisplayImageUrl } = await import('../displayImage');

    const url = await resolveDisplayImageUrl('file-3', 'token', 900, { w: 3000, h: 2000 });
    expect(url).toBe('blob:original');
    expect(rememberBlob).not.toHaveBeenCalled();
  });
});

it('cancels one image consumer without aborting another consumer of the same resize', async () => {
  const { resolveDisplayImageUrl } = await import('../displayImage');
  let finish!: (value: unknown) => void;
  fetchMock.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const first = new AbortController();
  const a = resolveDisplayImageUrl('shared', 'token', 900, { w: 3000, h: 2000 }, first.signal);
  const rejected = expect(a).rejects.toMatchObject({ name: 'AbortError' });
  const b = resolveDisplayImageUrl('shared', 'token', 900, { w: 3000, h: 2000 });
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  first.abort();
  await rejected;
  expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(false);
  finish({ ok: false });
  expect(await b).toBe('blob:original');
});
it('skips abandoned queued resizes without poisoning the original-image fallback', async () => {
  const { resolveDisplayImageUrl } = await import('../displayImage');
  const finishes: Array<(value: unknown) => void> = [];
  fetchMock.mockImplementation(() => new Promise((resolve) => finishes.push(resolve)));
  const a = resolveDisplayImageUrl('active-a', 'token', 900, { w: 3000, h: 2000 });
  const b = resolveDisplayImageUrl('active-b', 'token', 900, { w: 3000, h: 2000 });
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  const controller = new AbortController();
  const stale = resolveDisplayImageUrl(
    'stale',
    'token',
    900,
    { w: 3000, h: 2000 },
    controller.signal,
  );
  const rejected = expect(stale).rejects.toMatchObject({ name: 'AbortError' });
  await Promise.resolve();
  controller.abort();
  await rejected;
  finishes.forEach((finish) => finish({ ok: false }));
  await Promise.all([a, b]);
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(fetchMock).toHaveBeenCalledTimes(2);
  fetchMock.mockResolvedValue({ ok: false });
  await resolveDisplayImageUrl('stale', 'token', 900, { w: 3000, h: 2000 });
  expect(fetchMock).toHaveBeenCalledTimes(3);
});
