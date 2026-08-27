import { isMobileNative, isNativeShell } from './detect';
import { invokeCommand } from './native';

export interface SaveBlobOptions {
  fileName: string;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

function saveBlobViaAnchor(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function shareBlob(blob: Blob, fileName: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || typeof File === 'undefined') return false;
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };
  if (typeof nav.share !== 'function') return false;

  const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
  const data = { files: [file], title: fileName };
  try {
    if (typeof nav.canShare === 'function' && !nav.canShare(data)) {
      return false;
    }
    await nav.share(data);
    return true;
  } catch (err) {
    // User cancel is not a failure worth falling through to <a download>.
    if (err instanceof DOMException && err.name === 'AbortError') {
      return true;
    }
    console.warn('[common.platform] Web Share failed', err);
    return false;
  }
}

/**
 * Saves a Blob to disk. WKWebView / WebView2 / Android WebView often ignore
 * `<a download>`, so the native shell uses a system save dialog (desktop) or
 * the share sheet (mobile) first.
 */
export async function saveBlob(blob: Blob, options: SaveBlobOptions): Promise<boolean> {
  const fileName = options.fileName || 'download';

  if (isNativeShell()) {
    try {
      const contentsBase64 = await blobToBase64(blob);
      const saved = await invokeCommand<boolean>('save_file', {
        defaultName: fileName,
        contentsBase64,
      });
      return saved;
    } catch (err) {
      console.warn('[common.platform] native save_file failed, falling back', err);
    }
  }

  if (isMobileNative() && (await shareBlob(blob, fileName))) {
    return true;
  }

  if (typeof document === 'undefined') return false;
  saveBlobViaAnchor(blob, fileName);
  return true;
}

export interface PickFilesOptions {
  accept?: string;
  multiple?: boolean;
}

export function pickFiles(options: PickFilesOptions = {}): Promise<File[]> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve([]);
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.hidden = true;
    if (options.accept) input.accept = options.accept;
    input.multiple = Boolean(options.multiple);
    input.addEventListener('change', () => {
      const files = input.files ? Array.from(input.files) : [];
      input.remove();
      resolve(files);
    });
    input.addEventListener('cancel', () => {
      input.remove();
      resolve([]);
    });
    document.body.appendChild(input);
    input.click();
  });
}
