import JSZip from 'jszip';
import { describe, expect, it, vi } from 'vitest';
import {
  assertBoardArchivePassword,
  buildBoardArchive,
  collectBoardFiles,
  downloadBoardArchive,
  sha256Hex,
} from '../downloadBoardArchive';

describe('assertBoardArchivePassword', () => {
  it('отклоняет пустой и неверный пароль', async () => {
    await expect(assertBoardArchivePassword('')).rejects.toThrow('Неверный пароль');
    await expect(assertBoardArchivePassword('wrong-password')).rejects.toThrow('Неверный пароль');
  });
});

describe('sha256Hex', () => {
  it('совпадает с известным вектором SHA-256', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});

describe('collectBoardFiles', () => {
  it('собирает картинки, файлы фигур и imageSrc, без эмодзи', () => {
    const files = collectBoardFiles([
      {
        id: 'asset:1',
        typeName: 'asset',
        type: 'image',
        props: {
          src: '11111111-2222-3333-4444-555555555555',
          name: 'photo.png',
          mimeType: 'image/png',
        },
      },
      {
        id: 'shape:emoji',
        typeName: 'shape',
        type: 'emoji-sticker',
        props: { src: '1f600', w: 100, h: 100 },
      },
      {
        id: 'shape:pdf',
        typeName: 'shape',
        type: 'pdf',
        props: {
          src: 'https://api.example/content-service/files/pdf-file-id/',
          fileName: 'lesson.pdf',
        },
      },
      {
        id: 'shape:activity',
        typeName: 'shape',
        type: 'activity',
        props: {
          definition: { imageSrc: 'activity-image', items: [{ imageSrc: 'card-image' }] },
        },
      },
      {
        id: 'asset:bookmark',
        typeName: 'asset',
        type: 'bookmark',
        props: { src: 'https://example.com' },
      },
    ]);

    expect(files.map((file) => file.src).sort()).toEqual(
      [
        '11111111-2222-3333-4444-555555555555',
        'activity-image',
        'card-image',
        'pdf-file-id',
      ].sort(),
    );
    expect(files.find((file) => file.src === 'pdf-file-id')?.fileName).toBe('lesson.pdf');
    expect(
      files.find((file) => file.src === '11111111-2222-3333-4444-555555555555')?.mimeType,
    ).toBe('image/png');
  });

  it('берёт originalSrc, если в props ещё data URL', () => {
    const files = collectBoardFiles([
      {
        id: 'asset:1',
        typeName: 'asset',
        type: 'image',
        props: { src: 'data:image/png;base64,abc', name: 'preview.png' },
        meta: { originalSrc: 'stored-id' },
      },
    ]);

    expect(files).toEqual([{ src: 'stored-id', fileName: 'preview.png', mimeType: undefined }]);
  });
});

describe('downloadBoardArchive', () => {
  it('не скачивает архив при неверном пароле', async () => {
    const save = vi.fn();
    const fetchFile = vi.fn();

    await expect(
      downloadBoardArchive({
        password: 'nope',
        records: [{ id: 'asset:1', typeName: 'asset', type: 'image', props: { src: 'file-1' } }],
        save,
        fetchFile,
      }),
    ).rejects.toThrow('Неверный пароль');

    expect(save).not.toHaveBeenCalled();
    expect(fetchFile).not.toHaveBeenCalled();
  });
});

describe('buildBoardArchive', () => {
  it('кладёт json доски и скачанные файлы в zip', async () => {
    const png = new Blob([Uint8Array.from([1, 2, 3, 4])], { type: 'image/png' });
    const pdf = new Blob([Uint8Array.from([5, 6])], { type: 'application/pdf' });
    const fetchFile = vi.fn(async (src: string) => {
      if (src === 'image-id') return png;
      if (src === 'pdf-id') return pdf;
      throw new Error(`нет файла ${src}`);
    });

    const archive = await buildBoardArchive({
      now: new Date('2026-11-15T12:00:00.000Z'),
      records: [
        {
          id: 'asset:1',
          typeName: 'asset',
          type: 'image',
          props: { src: 'image-id', name: 'cat.png', mimeType: 'image/png' },
        },
        {
          id: 'shape:pdf',
          typeName: 'shape',
          type: 'pdf',
          props: { src: 'pdf-id', fileName: 'notes.pdf' },
        },
        {
          id: 'shape:missing',
          typeName: 'shape',
          type: 'file',
          props: { src: 'missing-id', fileName: 'gone.bin' },
        },
      ],
      fetchFile,
    });

    expect(archive.fileName).toBe('board-archive-2026-11-15T12-00-00-000Z.zip');
    const zip = await JSZip.loadAsync(await archive.blob.arrayBuffer());
    const board = JSON.parse(await zip.file('board.json')!.async('string')) as {
      records: Array<{ id: string }>;
    };
    expect(board.records.map((record) => record.id)).toEqual([
      'asset:1',
      'shape:pdf',
      'shape:missing',
    ]);

    expect(await zip.file('files/image-id--cat.png')!.async('uint8array')).toEqual(
      Uint8Array.from([1, 2, 3, 4]),
    );
    expect(await zip.file('files/pdf-id--notes.pdf')!.async('uint8array')).toEqual(
      Uint8Array.from([5, 6]),
    );

    const manifest = JSON.parse(await zip.file('files.json')!.async('string')) as {
      files: Array<{ src: string; path?: string; error?: string }>;
    };
    expect(manifest.files).toEqual(
      expect.arrayContaining([
        { src: 'image-id', path: 'files/image-id--cat.png', bytes: 4 },
        { src: 'pdf-id', path: 'files/pdf-id--notes.pdf', bytes: 2 },
        { src: 'missing-id', error: 'нет файла missing-id' },
      ]),
    );
  });
});
