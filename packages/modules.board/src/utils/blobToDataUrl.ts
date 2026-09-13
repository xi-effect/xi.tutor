/** Конвертирует Blob/File в data:URL без FileReader (устойчиво к затиранию window.FileReader). */
export async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const mime = blob.type || 'application/octet-stream';
  return `data:${mime};base64,${btoa(binary)}`;
}

export function dataUrlToFile(dataUrl: string, name: string): File | null {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return null;

  const header = dataUrl.slice(5, comma);
  const mime = header.split(';')[0] || 'application/octet-stream';
  const isBase64 = header.includes('base64');
  const payload = dataUrl.slice(comma + 1);

  try {
    const bytes = isBase64
      ? Uint8Array.from(atob(payload), (c) => c.charCodeAt(0))
      : new TextEncoder().encode(decodeURIComponent(payload));
    const ext = mime.split('/')[1]?.split('+')[0] || 'bin';
    const fileName = name.includes('.') ? name : `${name}.${ext}`;
    return new File([bytes], fileName, { type: mime });
  } catch {
    return null;
  }
}

export async function inlineSrcToFile(src: string, name: string): Promise<File | null> {
  if (src.startsWith('data:')) return dataUrlToFile(src, name);
  if (!src.startsWith('blob:')) return null;

  try {
    const blob = await fetch(src).then((response) => response.blob());
    return new File([blob], name, { type: blob.type || 'application/octet-stream' });
  } catch {
    return null;
  }
}
