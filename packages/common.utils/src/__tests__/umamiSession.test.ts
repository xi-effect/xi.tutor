import { afterEach, describe, expect, it, vi } from 'vitest';
import type { UserData } from 'common.types';
import { getUmamiClientSurface, trackUmamiSession } from '../umamiSession';

const user = {
  id: 42,
  default_layout: 'tutor',
  onboarding_stage: 'done',
  username: 'ivan',
  display_name: 'Иван',
} as UserData;

describe('trackUmamiSession', () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('ставит distinct id и не отправляет имя', async () => {
    const identify = vi.fn();
    (globalThis as { window?: unknown }).window = {
      umami: { identify },
      navigator: {},
      matchMedia: () => ({ matches: false }),
    };

    await trackUmamiSession(user, 'signin');

    expect(identify).toHaveBeenCalledWith('42', {
      user_id: 42,
      role: 'tutor',
      onboarding_stage: 'done',
      source: 'signin',
      client_surface: 'web',
    });
    const payload = identify.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('username');
    expect(payload).not.toHaveProperty('display_name');
  });

  it('отличает electron, native и pwa', () => {
    (globalThis as { window?: unknown }).window = {
      __SOVLIUM_ELECTRON__: true,
      navigator: {},
    };
    expect(getUmamiClientSurface()).toBe('electron');

    (globalThis as { window?: unknown }).window = {
      __SOVLIUM_NATIVE__: true,
      navigator: {},
    };
    expect(getUmamiClientSurface()).toBe('native');

    (globalThis as { window?: unknown }).window = {
      navigator: { standalone: true },
    };
    expect(getUmamiClientSurface()).toBe('pwa');
  });
});
