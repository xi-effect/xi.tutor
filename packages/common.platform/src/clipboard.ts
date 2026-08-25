import { isNativeShell } from './detect';

export async function writeText(text: string): Promise<void> {
  if (isNativeShell()) {
    try {
      const { writeText: writeNative } = await import('@tauri-apps/plugin-clipboard-manager');
      await writeNative(text);
      return;
    } catch (err) {
      console.warn('[common.platform] native clipboard write failed, falling back', err);
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  throw new Error('Clipboard write is not available');
}

export async function readText(): Promise<string> {
  if (isNativeShell()) {
    try {
      const { readText: readNative } = await import('@tauri-apps/plugin-clipboard-manager');
      return await readNative();
    } catch (err) {
      console.warn('[common.platform] native clipboard read failed, falling back', err);
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
    return navigator.clipboard.readText();
  }

  return '';
}

export async function writeHtmlAndText(html: string, plain: string): Promise<void> {
  if (isNativeShell()) {
    try {
      const { writeHtml } = await import('@tauri-apps/plugin-clipboard-manager');
      await writeHtml(html, plain);
      return;
    } catch (err) {
      console.warn('[common.platform] native HTML clipboard write failed, using text', err);
      await writeText(plain || html);
      return;
    }
  }

  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard?.write &&
      typeof ClipboardItem !== 'undefined'
    ) {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plain], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);
      return;
    }
  } catch (err) {
    console.warn('[common.platform] HTML clipboard write failed, using text', err);
  }
  await writeText(plain || html);
}

export async function readHtml(): Promise<string> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.read) {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes('text/html')) {
          const blob = await item.getType('text/html');
          return blob.text();
        }
      }
    }
  } catch (err) {
    console.warn('[common.platform] HTML clipboard read failed, using text', err);
  }
  return readText();
}
