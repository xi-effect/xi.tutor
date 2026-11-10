/**
 * Размеры картинки из заголовка файла, без декодирования.
 * Нужны, чтобы решить, можно ли вообще безопасно декодировать файл: растр на 80+ Мп
 * занимает ~350 МБ RGBA, и iPhone убивает вкладку, не показав никакой ошибки.
 */

export type ImageSize = { w: number; h: number };

/** Заголовок JPEG с SOF может стоять после EXIF и превью, обычно это первые десятки КБ. */
const HEADER_BYTES = 512 * 1024;

function u16be(b: Uint8Array, i: number) {
  return (b[i] << 8) | b[i + 1];
}

function u32be(b: Uint8Array, i: number) {
  return ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
}

function ascii(b: Uint8Array, i: number, len: number) {
  let out = '';
  for (let k = 0; k < len; k++) out += String.fromCharCode(b[i + k] ?? 0);
  return out;
}

function pngSize(b: Uint8Array): ImageSize | null {
  if (b.length < 24 || ascii(b, 12, 4) !== 'IHDR') return null;
  return { w: u32be(b, 16), h: u32be(b, 20) };
}

function gifSize(b: Uint8Array): ImageSize | null {
  if (b.length < 10) return null;
  return { w: b[6] | (b[7] << 8), h: b[8] | (b[9] << 8) };
}

function jpegSize(b: Uint8Array): ImageSize | null {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = b[i + 1];
    if (marker === 0xff) {
      i++;
      continue;
    }
    // Маркеры без длины.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) return { h: u16be(b, i + 5), w: u16be(b, i + 7) };
    const length = u16be(b, i + 2);
    if (length < 2) return null;
    i += 2 + length;
  }
  return null;
}

function webpSize(b: Uint8Array): ImageSize | null {
  if (b.length < 30) return null;
  const chunk = ascii(b, 12, 4);
  if (chunk === 'VP8X') {
    const w = 1 + (b[24] | (b[25] << 8) | (b[26] << 16));
    const h = 1 + (b[27] | (b[28] << 8) | (b[29] << 16));
    return { w, h };
  }
  if (chunk === 'VP8L') {
    if (b[20] !== 0x2f) return null;
    const w = 1 + (b[21] | ((b[22] & 0x3f) << 8));
    const h = 1 + ((b[22] >> 6) | (b[23] << 2) | ((b[24] & 0x0f) << 10));
    return { w, h };
  }
  if (chunk === 'VP8 ') {
    return { w: (b[26] | (b[27] << 8)) & 0x3fff, h: (b[28] | (b[29] << 8)) & 0x3fff };
  }
  return null;
}

export function parseImageSize(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 10) return null;
  let size: ImageSize | null = null;
  if (bytes[0] === 0x89 && bytes[1] === 0x50) size = pngSize(bytes);
  else if (bytes[0] === 0xff && bytes[1] === 0xd8) size = jpegSize(bytes);
  else if (ascii(bytes, 0, 4) === 'GIF8') size = gifSize(bytes);
  else if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') size = webpSize(bytes);
  if (!size || size.w < 1 || size.h < 1) return null;
  return size;
}

/** `null` — формат не распознан, размеров из заголовка узнать не удалось. */
export async function readImageSize(blob: Blob): Promise<ImageSize | null> {
  try {
    const buffer = await blob.slice(0, HEADER_BYTES).arrayBuffer();
    return parseImageSize(new Uint8Array(buffer));
  } catch {
    return null;
  }
}
