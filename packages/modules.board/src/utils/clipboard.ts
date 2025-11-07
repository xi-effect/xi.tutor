export async function writeClipboardHtmlAndText(html: string, plain: string) {
  try {
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([plain], { type: 'text/plain' });

    if (navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(html);
    }
  } catch (error) {
    console.error('Failed to write clipboard:', error);
  }
}

export async function readClipboardHtml(): Promise<string> {
  try {
    if (navigator.clipboard?.read) {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes('text/html')) {
          const blob = await item.getType('text/html');
          return await blob.text();
        }
      }
    }
    if (navigator.clipboard?.readText) {
      return await navigator.clipboard.readText();
    }
  } catch (error) {
    console.error('Failed to read clipboard:', error);
  }
  return '';
}

export function extractClipboardImages(event: ClipboardEvent): File[] {
  const clipboardData = event.clipboardData;
  if (!clipboardData) return [];
  const items = Array.from(clipboardData.items);
  return items
    .filter((item) => item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter((f): f is File => !!f);
}
