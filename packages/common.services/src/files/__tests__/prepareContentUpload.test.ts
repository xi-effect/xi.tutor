import { describe, expect, it } from 'vitest';
import { FILE_KIND } from 'common.api';
import { getContentUploadKind, prepareContentUpload } from '../prepareContentUpload';

describe('getContentUploadKind', () => {
  it('классифицирует png даже с пустым MIME (Safari/Яндекс)', () => {
    const file = new File([new Uint8Array([137, 80, 78, 71])], 'photo.png', { type: '' });
    expect(getContentUploadKind(file)).toBe(FILE_KIND.Image);
  });

  it('нормализует alias image/x-png', () => {
    const file = new File(['x'], 'photo.png', { type: 'image/x-png' });
    expect(getContentUploadKind(file)).toBe(FILE_KIND.Image);
    expect(prepareContentUpload(file).file.type).toBe('image/png');
  });

  it('отправляет pdf в document, а не в uncategorized', () => {
    const file = new File(['%PDF'], 'lecture.pdf', { type: 'application/pdf' });
    expect(getContentUploadKind(file)).toBe(FILE_KIND.Document);
  });

  it('распознаёт pptx по расширению, даже если браузер отдал zip', () => {
    const file = new File(['PK'], 'slides.pptx', { type: 'application/zip' });
    expect(getContentUploadKind(file)).toBe(FILE_KIND.Presentation);
    expect(prepareContentUpload(file).file.type).toBe(
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    );
  });

  it('не путает ppt с презентацией бэкенда (там только pptx)', () => {
    const file = new File(['x'], 'old.ppt', { type: 'application/vnd.ms-powerpoint' });
    expect(getContentUploadKind(file)).toBe(FILE_KIND.Uncategorized);
  });
});
