import { describe, expect, it } from 'vitest';
import { parseImageSize, readImageSize } from '../imageHeader';

function png(w: number, h: number) {
  const b = new Uint8Array(33);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  b.set([0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52], 8);
  new DataView(b.buffer).setUint32(16, w);
  new DataView(b.buffer).setUint32(20, h);
  return b;
}

function jpeg(w: number, h: number, withExifSegment = true) {
  const parts: number[] = [0xff, 0xd8];
  if (withExifSegment) {
    // APP1 длиной 20 байт, которую парсер должен пропустить
    parts.push(0xff, 0xe1, 0x00, 0x14, ...new Array(18).fill(0));
  }
  // SOF0: длина 17, точность 8, высота, ширина
  parts.push(0xff, 0xc0, 0x00, 0x11, 0x08, h >> 8, h & 0xff, w >> 8, w & 0xff, 3, 0, 0, 0, 0, 0, 0);
  return new Uint8Array(parts);
}

function webpVp8x(w: number, h: number) {
  const b = new Uint8Array(30);
  b.set([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x58]);
  const cw = w - 1;
  const ch = h - 1;
  b.set([cw & 0xff, (cw >> 8) & 0xff, (cw >> 16) & 0xff], 24);
  b.set([ch & 0xff, (ch >> 8) & 0xff, (ch >> 16) & 0xff], 27);
  return b;
}

describe('parseImageSize', () => {
  it('читает PNG', () => {
    expect(parseImageSize(png(6610, 13043))).toEqual({ w: 6610, h: 13043 });
  });

  it('читает JPEG, пропуская служебные сегменты до SOF', () => {
    expect(parseImageSize(jpeg(4000, 3000))).toEqual({ w: 4000, h: 3000 });
    expect(parseImageSize(jpeg(800, 600, false))).toEqual({ w: 800, h: 600 });
  });

  it('читает WebP (VP8X)', () => {
    expect(parseImageSize(webpVp8x(7580, 13461))).toEqual({ w: 7580, h: 13461 });
  });

  it('читает GIF', () => {
    const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x40, 0x01, 0xf0, 0x00, 0, 0]);
    expect(parseImageSize(gif)).toEqual({ w: 320, h: 240 });
  });

  it('возвращает null для мусора и обрезанных файлов', () => {
    expect(parseImageSize(new Uint8Array([1, 2, 3]))).toBeNull();
    expect(parseImageSize(new Uint8Array(40))).toBeNull();
    expect(
      parseImageSize(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0, 4, 0, 0, 0, 0, 0, 0])),
    ).toBeNull();
  });
});

describe('readImageSize', () => {
  it('читает размеры из Blob', async () => {
    const blob = new Blob([png(1000, 2000)], { type: 'image/png' });
    expect(await readImageSize(blob)).toEqual({ w: 1000, h: 2000 });
  });
});
