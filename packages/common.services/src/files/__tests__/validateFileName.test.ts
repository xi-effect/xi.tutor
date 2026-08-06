import { describe, expect, it } from 'vitest';
import {
  assertValidFileName,
  FILE_NAME_TOO_LONG_MESSAGE,
  isFileNameTooLong,
  MAX_FILENAME_LENGTH,
} from '../validateFileName';

describe('validateFileName', () => {
  it('accepts names up to the limit', () => {
    expect(isFileNameTooLong('a'.repeat(MAX_FILENAME_LENGTH))).toBe(false);
  });

  it('rejects names longer than the limit', () => {
    expect(isFileNameTooLong('a'.repeat(MAX_FILENAME_LENGTH + 1))).toBe(true);
  });

  it('throws a clear error for invalid file names', () => {
    const file = new File(['x'], 'a'.repeat(MAX_FILENAME_LENGTH + 1), { type: 'text/plain' });

    expect(() => assertValidFileName(file)).toThrow(FILE_NAME_TOO_LONG_MESSAGE);
  });
});
