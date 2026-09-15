import { describe, expect, it } from 'vitest';
import { cloneDroppedFile, collectDroppedFiles } from '../collectDroppedFiles';

describe('collectDroppedFiles', () => {
  it('берёт файлы из files и клонирует их', () => {
    const original = new File(['png'], 'photo.png', { type: 'image/png' });
    const collected = collectDroppedFiles({ files: [original] });

    expect(collected).toHaveLength(1);
    expect(collected[0]?.name).toBe('photo.png');
    expect(collected[0]).not.toBe(original);
  });

  it('берёт файлы из items, если files пустой', () => {
    const file = new File(['pdf'], 'notes.pdf', { type: 'application/pdf' });
    const collected = collectDroppedFiles({
      files: [],
      items: [{ kind: 'file', getAsFile: () => file }],
    });

    expect(collected).toHaveLength(1);
    expect(collected[0]?.name).toBe('notes.pdf');
  });

  it('игнорирует не-файловые items', () => {
    expect(
      collectDroppedFiles({
        files: [],
        items: [{ kind: 'string', getAsFile: () => null }],
      }),
    ).toEqual([]);
  });
});

describe('cloneDroppedFile', () => {
  it('сохраняет имя и mime', () => {
    const file = new File(['x'], 'a.webp', { type: 'image/webp', lastModified: 10 });
    const cloned = cloneDroppedFile(file);
    expect(cloned.name).toBe('a.webp');
    expect(cloned.type).toBe('image/webp');
    expect(cloned.lastModified).toBe(10);
  });
});
