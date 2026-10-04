import { getSovliumDesktop } from 'common.platform';
import type { RecordingSink } from './types';
import { withWebmDuration } from './webmDuration';

const OPFS_CLEANUP_MS = 60_000;

function triggerDownload(file: Blob, filename: string): void {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), OPFS_CLEANUP_MS);
}

async function uniqueName(root: FileSystemDirectoryHandle, filename: string): Promise<string> {
  const dot = filename.lastIndexOf('.');
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  const extension = dot > 0 ? filename.slice(dot) : '';
  let name = filename;
  for (let index = 2; index < 100; index += 1) {
    try {
      await root.getFileHandle(name);
      name = `${base} ${index}${extension}`;
    } catch {
      return name;
    }
  }
  return `${base} ${Date.now()}${extension}`;
}

async function createOpfsSink(filename: string): Promise<RecordingSink> {
  const root = await navigator.storage.getDirectory();
  const storedName = await uniqueName(root, filename);
  const handle = await root.getFileHandle(storedName, { create: true });
  const writable = await handle.createWritable();
  let sizeBytes = 0;
  let settled = false;

  return {
    async write(chunk) {
      if (settled || chunk.size === 0) return;
      await writable.write(await chunk.arrayBuffer());
      sizeBytes += chunk.size;
    },
    async finalize(durationMs) {
      if (!settled) {
        settled = true;
        await writable.close();
      }
      const file = await handle.getFile();
      const size = sizeBytes || file.size;
      if (size === 0) {
        await root.removeEntry(storedName).catch(() => undefined);
        throw new Error('sink_error');
      }
      const typed = new Blob([await file.arrayBuffer()], {
        type: file.type || 'video/webm',
      });
      const download = await withWebmDuration(typed, durationMs);
      triggerDownload(download, storedName);
      window.setTimeout(() => {
        void root.removeEntry(storedName).catch(() => undefined);
      }, OPFS_CLEANUP_MS);
      return { sizeBytes: download.size || size, filename: storedName };
    },
    async abort() {
      if (settled) return;
      settled = true;
      try {
        await writable.abort();
      } catch {
        try {
          await writable.close();
        } catch {
          // Файл всё равно удаляем ниже.
        }
      }
      try {
        await root.removeEntry(storedName);
      } catch {
        // Уже удалён или браузер не отдал ручку.
      }
    },
  };
}

function createMemorySink(filename: string): RecordingSink {
  const chunks: Blob[] = [];
  let settled = false;
  return {
    async write(chunk) {
      if (settled || chunk.size === 0) return;
      chunks.push(chunk);
    },
    async finalize(durationMs) {
      settled = true;
      const blob = new Blob(chunks, { type: chunks[0]?.type || 'video/webm' });
      if (blob.size === 0) throw new Error('sink_error');
      const download = await withWebmDuration(blob, durationMs);
      triggerDownload(download, filename);
      return { sizeBytes: download.size, filename };
    },
    async abort() {
      settled = true;
      chunks.length = 0;
    },
  };
}

/** Поток в файл, который главный процесс Electron уже открыл диалогом сохранения. */
export function createElectronRecordingSink(fileId: string, filename: string): RecordingSink {
  const desktop = getSovliumDesktop();
  if (!desktop) {
    throw new Error('conference_unavailable');
  }
  return {
    async write(chunk) {
      if (chunk.size === 0) return;
      const bytes = new Uint8Array(await chunk.arrayBuffer());
      const written = await desktop.recording.write({ fileId, bytes });
      if (!written) throw new Error('sink_error');
    },
    async finalize() {
      const closed = await desktop.recording.close({ fileId });
      const sizeBytes = closed?.sizeBytes ?? 0;
      if (sizeBytes === 0) throw new Error('sink_error');
      return { sizeBytes, filename };
    },
    async abort() {
      await desktop.recording.discard({ fileId });
    },
  };
}

/** Пишет куски на диск через OPFS. Если OPFS нет — копит blob и скачивает в конце. */
export async function createBrowserRecordingSink(filename: string): Promise<RecordingSink> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage) {
      return createMemorySink(filename);
    }
    return await createOpfsSink(filename);
  } catch {
    return createMemorySink(filename);
  }
}
