import { describe, expect, it } from 'vitest';
import { dataUrlToFile } from '../blobToDataUrl';

describe('dataUrlToFile', () => {
  it('собирает File из base64 data URL', async () => {
    const file = dataUrlToFile('data:image/png;base64,aGVsbG8=', 'shot');
    expect(file).not.toBeNull();
    expect(file?.type).toBe('image/png');
    expect(file?.name).toBe('shot.png');
    expect(await file!.text()).toBe('hello');
  });
});
