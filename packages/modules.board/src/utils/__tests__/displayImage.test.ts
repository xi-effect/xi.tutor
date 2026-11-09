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
