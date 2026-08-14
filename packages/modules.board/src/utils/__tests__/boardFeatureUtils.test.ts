import { describe, expect, it } from 'vitest';
import { formatFileSize, formatTime } from '../../shapes/audio/utils/format';
import { getStickerNoteHeight, getStickerNoteShadow } from '../../shapes/sticker/stickerNoteUtils';
import { snapLine, snapText } from '../../shapes/coordinate-axes/utils/snapCoords';
import {
  ALLOWED_AUDIO_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  getFileExtension,
  isPdfMime,
} from '../../constants/mimeTypes';
import { parseBoardBackgroundFromYMap } from '../boardBackground';
import { blobToDataUrl } from '../blobToDataUrl';
import { BOARD_SCHEMA_VERSION, DEMO_YDOC_ID } from '../yjsConstants';
import * as Y from 'yjs';

describe('audio format', () => {
  it('форматирует время и размер', () => {
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(-3)).toBe('00:00');
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
  });
});

describe('sticker note utils', () => {
  it('считает высоту с growY и scale', () => {
    expect(getStickerNoteHeight({ props: { growY: 10, scale: 2 } } as never, 100)).toBe(220);
  });

  it('собирает css-тень', () => {
    expect(getStickerNoteShadow(1, 0)).toContain('rgba(15, 23, 31');
  });
});

describe('snapCoords', () => {
  it('округляет текст и линии', () => {
    expect(snapText(10.4)).toBe(10);
    expect(snapLine(10.4)).toBe(10.5);
  });
});

describe('mimeTypes', () => {
  it('проверяет pdf и расширение', () => {
    expect(isPdfMime('application/pdf')).toBe(true);
    expect(isPdfMime('image/png')).toBe(false);
    expect(getFileExtension('lecture.PDF')).toBe('pdf');
    expect(getFileExtension('noext')).toBeNull();
    expect(ALLOWED_IMAGE_MIME_TYPES.has('image/png')).toBe(true);
    expect(ALLOWED_AUDIO_MIME_TYPES.has('audio/mpeg')).toBe(true);
  });
});

describe('parseBoardBackgroundFromYMap', () => {
  it('читает валидные значения и подставляет дефолты', () => {
    const doc = new Y.Doc();
    const map = doc.getMap<string>('boardBackground');
    map.set('type', 'grid');
    map.set('color', 'cream');
    expect(parseBoardBackgroundFromYMap(map)).toEqual({ type: 'grid', color: 'cream' });

    const empty = new Y.Doc().getMap<string>('boardBackground');
    expect(parseBoardBackgroundFromYMap(empty)).toEqual({ type: 'dots', color: 'white' });
  });
});

describe('blobToDataUrl', () => {
  it('кодирует blob в data URL', async () => {
    const blob = new Blob(['hi'], { type: 'text/plain' });
    const url = await blobToDataUrl(blob);
    expect(url.startsWith('data:text/plain;base64,')).toBe(true);
    expect(url).toContain(btoa('hi'));
  });
});

describe('yjsConstants', () => {
  it('держит draw schema и demo ids', () => {
    expect(BOARD_SCHEMA_VERSION).toBe('draw');
    expect(DEMO_YDOC_ID).toBe('test/demo-room');
  });
});
