import { isElectronShell, isTauriShell } from './detect';
import { getSovliumDesktop } from './electron';

async function writeTextElectron(text: string): Promise<boolean> {
  if (!isElectronShell()) return false;
  try {
    await getSovliumDesktop()?.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.warn('[common.platform] electron clipboard write failed', err);
    return false;
  }
}

async function readTextElectron(): Promise<string | null> {
  if (!isElectronShell()) return null;
  try {
    return (await getSovliumDesktop()?.clipboard.readText()) ?? '';
  } catch (err) {
    console.warn('[common.platform] electron clipboard read failed', err);
    return null;
  }
}

export async function writeText(text: string): Promise<void> {
  if (isTauriShell()) {
    try {
      const { writeText: writeNative } = await import('@tauri-apps/plugin-clipboard-manager');
      await writeNative(text);
      return;
    } catch (err) {
      console.warn('[common.platform] native clipboard write failed, falling back', err);
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (err) {
      if (await writeTextElectron(text)) return;
      throw err;
    }
  }

  if (await writeTextElectron(text)) return;
  throw new Error('Clipboard write is not available');
}

export async function readText(): Promise<string> {
  if (isTauriShell()) {
    try {
      const { readText: readNative } = await import('@tauri-apps/plugin-clipboard-manager');
      return await readNative();
    } catch (err) {
      console.warn('[common.platform] native clipboard read failed, falling back', err);
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
    try {
      return await navigator.clipboard.readText();
    } catch (err) {
      const fallback = await readTextElectron();
      if (fallback != null) return fallback;
      console.warn('[common.platform] clipboard read failed', err);
    }
  }

  return (await readTextElectron()) ?? '';
}

export async function writeHtmlAndText(html: string, plain: string): Promise<void> {
  if (isTauriShell()) {
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
    console.warn('[common.platform] HTML clipboard write failed, using native/text', err);
    if (isElectronShell()) {
      try {
        await getSovliumDesktop()?.clipboard.writeHtml(html, plain);
        return;
      } catch (nativeErr) {
        console.warn('[common.platform] electron HTML clipboard write failed', nativeErr);
      }
    }
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
    console.warn('[common.platform] HTML clipboard read failed, using native/text', err);
    if (isElectronShell()) {
      try {
        const html = await getSovliumDesktop()?.clipboard.readHtml();
        if (html) return html;
      } catch (nativeErr) {
        console.warn('[common.platform] electron HTML clipboard read failed', nativeErr);
      }
    }
  }
  return readText();
}
