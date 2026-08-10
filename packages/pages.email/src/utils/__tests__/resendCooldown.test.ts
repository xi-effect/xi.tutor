import { describe, expect, it } from 'vitest';
import { calculateResendTimeRemaining, formatResendCooldown } from '../resendCooldown';

describe('formatResendCooldown', () => {
  it('форматирует MM:SS', () => {
    expect(formatResendCooldown(0)).toBe('00:00');
    expect(formatResendCooldown(65)).toBe('01:05');
    expect(formatResendCooldown(125)).toBe('02:05');
  });
});

describe('calculateResendTimeRemaining', () => {
  it('возвращает 0 без allowedAt или если время прошло', () => {
    const now = new Date('2026-04-21T12:00:00Z');
    expect(calculateResendTimeRemaining(null, now)).toBe(0);
    expect(calculateResendTimeRemaining('2026-04-21T11:59:00Z', now)).toBe(0);
  });

  it('считает оставшиеся секунды', () => {
    const now = new Date('2026-04-21T12:00:00Z');
    expect(calculateResendTimeRemaining('2026-04-21T12:01:30Z', now)).toBe(90);
  });
});
