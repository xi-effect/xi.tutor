import { describe, expect, it } from 'vitest';
import {
  isBinaryClipboardFile,
  looksLikeMarkup,
  readPasteClipboardSnapshot,
} from '../pasteClipboard';

function mockDataTransfer(options: {
  html?: string;
  plain?: string;
  uriList?: string;
  files?: File[];
}): DataTransfer {
  const files = options.files ?? [];
  return {
    getData: (type: string) => {
      if (type === 'text/html') return options.html ?? '';
      if (type === 'text/plain') return options.plain ?? '';
      if (type === 'text/uri-list') return options.uriList ?? '';
      return '';
    },
    files,
    items: files.map((file) => ({
      kind: 'file',
      getAsFile: () => file,
    })),
  } as unknown as DataTransfer;
}

describe('isBinaryClipboardFile', () => {
  it('принимает картинку с размером', () => {
    expect(isBinaryClipboardFile(new File(['png'], 'shot.png', { type: 'image/png' }))).toBe(true);
  });

  it('отбрасывает пустой и текстовый файл', () => {
    expect(isBinaryClipboardFile(new File([], 'empty.png', { type: 'image/png' }))).toBe(false);
    expect(isBinaryClipboardFile(new File(['hi'], 'note.txt', { type: 'text/plain' }))).toBe(false);
  });
});

describe('looksLikeMarkup', () => {
  it('отличает html от обычного текста и url', () => {
    expect(looksLikeMarkup('<p>hi</p>')).toBe(true);
    expect(looksLikeMarkup('просто текст')).toBe(false);
    expect(looksLikeMarkup('https://example.com/path')).toBe(false);
  });
});

describe('readPasteClipboardSnapshot', () => {
  it('читает plain text и ссылку без html', () => {
    expect(readPasteClipboardSnapshot(mockDataTransfer({ plain: 'привет' }))).toEqual({
      html: '',
      text: 'привет',
      files: [],
    });
    expect(
      readPasteClipboardSnapshot(mockDataTransfer({ uriList: 'https://xi.effect' })),
    ).toMatchObject({
      html: '',
      text: 'https://xi.effect',
    });
  });

  it('не считает текстовый clipboard-item файлом', () => {
    const snapshot = readPasteClipboardSnapshot(
      mockDataTransfer({
        plain: 'https://example.com',
        files: [new File(['url'], 'link.txt', { type: 'text/plain' })],
      }),
    );
    expect(snapshot.text).toBe('https://example.com');
    expect(snapshot.files).toHaveLength(0);
  });
});
