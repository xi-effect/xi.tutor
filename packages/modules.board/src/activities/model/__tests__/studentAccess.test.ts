import { describe, expect, it } from 'vitest';
import { normalizeStudentAccess } from '../studentAccess';

describe('normalizeStudentAccess', () => {
  it('defaults reveal to false and the rest to true', () => {
    expect(normalizeStudentAccess(undefined)).toEqual({
      canInteract: true,
      canCheck: true,
      canReset: true,
      canReveal: false,
    });
  });

  it('keeps explicit flags', () => {
    expect(
      normalizeStudentAccess({
        canInteract: false,
        canCheck: false,
        canReset: true,
        canReveal: true,
      }),
    ).toEqual({
      canInteract: false,
      canCheck: false,
      canReset: true,
      canReveal: true,
    });
  });
});
