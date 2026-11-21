import { describe, expect, it } from 'vitest';
import { isEmailWaitingScreen } from '../useEmailToken';

describe('isEmailWaitingScreen', () => {
  it('считает экран ожидания без токена и со служебным confirm', () => {
    expect(isEmailWaitingScreen(undefined)).toBe(true);
    expect(isEmailWaitingScreen('confirm')).toBe(true);
  });

  it('ссылку из письма не считает экраном ожидания', () => {
    expect(isEmailWaitingScreen('token-from-letter')).toBe(false);
  });
});
