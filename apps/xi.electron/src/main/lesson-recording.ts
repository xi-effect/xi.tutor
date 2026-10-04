import { BrowserWindow, dialog, type IpcMainInvokeEvent } from 'electron';
import { randomUUID } from 'node:crypto';
import { createWriteStream, type WriteStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { EVENTS } from '../shared/channels';
import type { ConferenceController } from './conference/controller';
import { sendToRenderer } from './send';

const MAX_CHUNK_BYTES = 8 * 1024 * 1024;

type Session = {
  stream: WriteStream;
  path: string;
  bytes: number;
  closed: boolean;
};

const sessions = new Map<string, Session>();

function senderUrl(event: IpcMainInvokeEvent): string {
  return event.senderFrame?.url ?? event.sender.getURL();
}

function isConferenceSender(event: IpcMainInvokeEvent): boolean {
  return senderUrl(event).includes('/desktop/conference/');
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function safeName(name: string): string {
  const cleaned = name.replace(/[/\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 180);
  return cleaned || 'Sovlium lesson.webm';
}

function readBytes(value: unknown): Buffer | null {
  if (Buffer.isBuffer(value)) {
    return value.byteLength > MAX_CHUNK_BYTES ? null : value;
  }
  if (value instanceof Uint8Array) {
    if (value.byteLength > MAX_CHUNK_BYTES) return null;
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  }
  return null;
}

async function discardSession(fileId: string): Promise<void> {
  const session = sessions.get(fileId);
  if (!session) return;
  sessions.delete(fileId);
  session.closed = true;
  await new Promise<void>((resolve) => {
    session.stream.end(() => resolve());
  });
  await unlink(session.path).catch(() => undefined);
}

export async function openLessonRecording(
  event: IpcMainInvokeEvent,
  input: unknown,
  options: {
    getMainWindow: () => BrowserWindow | null;
    conference: ConferenceController;
  },
): Promise<{ fileId: string } | { error: 'cancelled' | 'conference_unavailable' }> {
  const record = asRecord(input);
  const defaultName = safeName(typeof record.defaultName === 'string' ? record.defaultName : '');
  const mimeType = typeof record.mimeType === 'string' ? record.mimeType.slice(0, 120) : '';
  const parent = options.getMainWindow() ?? BrowserWindow.fromWebContents(event.sender);
  const result = parent
    ? await dialog.showSaveDialog(parent, {
        defaultPath: defaultName,
        filters: [
          { name: 'WebM', extensions: ['webm'] },
          { name: 'MP4', extensions: ['mp4'] },
        ],
      })
    : await dialog.showSaveDialog({ defaultPath: defaultName });

  if (result.canceled || !result.filePath) return { error: 'cancelled' };

  const fileId = randomUUID();
  const stream = createWriteStream(result.filePath);
  const session: Session = { stream, path: result.filePath, bytes: 0, closed: false };
  stream.on('error', () => {
    session.closed = true;
  });
  sessions.set(fileId, session);

  let sourceId = '';
  try {
    sourceId = options.getMainWindow()?.getMediaSourceId() ?? '';
  } catch {
    sourceId = '';
  }

  const sent =
    sourceId.length > 0 &&
    options.conference.postToConference(EVENTS.recordingCommand, {
      action: 'start',
      fileId,
      sourceId,
      mimeType,
    });

  if (!sent) {
    await discardSession(fileId);
    return { error: 'conference_unavailable' };
  }

  return { fileId };
}

export function writeLessonRecording(event: IpcMainInvokeEvent, input: unknown): Promise<boolean> {
  if (!isConferenceSender(event)) return Promise.resolve(false);
  const record = asRecord(input);
  const fileId = typeof record.fileId === 'string' ? record.fileId : '';
  const session = sessions.get(fileId);
  const bytes = readBytes(record.bytes);
  if (!session || session.closed || !bytes) return Promise.resolve(false);

  return new Promise((resolve) => {
    session.stream.write(bytes, (error) => {
      if (error) {
        session.closed = true;
        resolve(false);
        return;
      }
      session.bytes += bytes.byteLength;
      resolve(true);
    });
  });
}

export function closeLessonRecording(
  event: IpcMainInvokeEvent,
  input: unknown,
): Promise<{ sizeBytes: number } | null> {
  if (!isConferenceSender(event)) return Promise.resolve(null);
  const fileId = typeof asRecord(input).fileId === 'string' ? String(asRecord(input).fileId) : '';
  const session = sessions.get(fileId);
  if (!session) return Promise.resolve(null);
  sessions.delete(fileId);
  if (session.closed) return Promise.resolve({ sizeBytes: session.bytes });
  session.closed = true;
  return new Promise((resolve) => {
    session.stream.end(() => resolve({ sizeBytes: session.bytes }));
  });
}

export async function discardLessonRecording(
  event: IpcMainInvokeEvent,
  input: unknown,
): Promise<void> {
  if (!isConferenceSender(event)) return;
  const fileId = typeof asRecord(input).fileId === 'string' ? String(asRecord(input).fileId) : '';
  await discardSession(fileId);
}

export function requestLessonRecordingStop(
  event: IpcMainInvokeEvent,
  conference: ConferenceController,
): void {
  if (isConferenceSender(event)) return;
  conference.postToConference(EVENTS.recordingCommand, { action: 'stop' });
}

function readStatus(value: unknown): Record<string, unknown> | null {
  const record = asRecord(value);
  if (record.phase === 'recording' && typeof record.startedAt === 'number') {
    return { phase: 'recording', startedAt: record.startedAt };
  }
  if (record.phase === 'saved') {
    return {
      phase: 'saved',
      sizeBytes: typeof record.sizeBytes === 'number' ? record.sizeBytes : 0,
      format: record.format === 'mp4' ? 'mp4' : 'webm',
      filename: typeof record.filename === 'string' ? record.filename.slice(0, 180) : '',
    };
  }
  if (record.phase === 'error' && typeof record.reason === 'string') {
    return { phase: 'error', reason: record.reason.slice(0, 80) };
  }
  if (record.phase === 'idle') return { phase: 'idle' };
  return null;
}

export function reportLessonRecordingStatus(
  event: IpcMainInvokeEvent,
  input: unknown,
  getMainWindow: () => BrowserWindow | null,
): void {
  if (!isConferenceSender(event)) return;
  const status = readStatus(input);
  if (!status) return;
  sendToRenderer(getMainWindow()?.webContents, EVENTS.recordingStatus, status);
}

export function reportLessonRecordingPresence(
  event: IpcMainInvokeEvent,
  input: unknown,
  getMainWindow: () => BrowserWindow | null,
): void {
  if (!isConferenceSender(event)) return;
  const record = asRecord(input);
  if (typeof record.active !== 'boolean') return;
  sendToRenderer(getMainWindow()?.webContents, EVENTS.recordingPresence, {
    active: record.active,
    startedAt: record.active && typeof record.startedAt === 'number' ? record.startedAt : null,
  });
}
