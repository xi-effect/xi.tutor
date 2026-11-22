import { afterEach, describe, expect, it, vi } from 'vitest';
import type { UserData } from 'common.types';
import { trackUmamiSession } from '../../umamiSession';
import { PRODUCT_ANALYTICS_EVENTS } from '../events';
import { trackProductEvent } from '../umami';
import {
  CAMPAIGN_AT_STORAGE_KEY,
  CAMPAIGN_ID_STORAGE_KEY,
  campaignIdFromSearch,
  captureCampaignAttribution,
  getCampaignId,
  normalizeCampaignId,
  resetCampaignAttributionForTests,
} from '../campaignAttribution';

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (index) => [...store.keys()][index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, String(value));
    },
  };
}

describe('campaign attribution', () => {
  afterEach(() => {
    resetCampaignAttributionForTests();
    delete (globalThis as { window?: unknown }).window;
  });

  it('принимает короткий id и отбрасывает почту и свободный текст', () => {
    expect(normalizeCampaignId(' spring-2026 ')).toBe('spring-2026');
    expect(normalizeCampaignId('550e8400-e29b-41d4-a716-446655440000')).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    );
    expect(normalizeCampaignId('user@mail.ru')).toBeUndefined();
    expect(normalizeCampaignId('кампания')).toBeUndefined();
    expect(normalizeCampaignId('')).toBeUndefined();
    expect(normalizeCampaignId('a'.repeat(65))).toBeUndefined();
  });

  it('читает campaign_id из query и из redirect после редиректа на вход', () => {
    expect(campaignIdFromSearch('?campaign_id=letter-1')).toBe('letter-1');
    expect(
      campaignIdFromSearch('?redirect=' + encodeURIComponent('/classrooms?campaign_id=letter-2')),
    ).toBe('letter-2');
    expect(campaignIdFromSearch('?campaign_id=user@mail.ru')).toBeUndefined();
  });

  it('помечает анонимную сессию и шлёт визит один раз на вкладку', async () => {
    const track = vi.fn();
    const identify = vi.fn();
    (globalThis as { window?: unknown }).window = {
      umami: { track, identify },
      localStorage: createStorage(),
      sessionStorage: createStorage(),
      location: { search: '?campaign_id=letter-1' },
    };

    captureCampaignAttribution();
    captureCampaignAttribution();
    await Promise.resolve();

    expect(getCampaignId()).toBe('letter-1');
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith(PRODUCT_ANALYTICS_EVENTS.CAMPAIGN_VISIT, {
      event_version: 1,
      campaign_id: 'letter-1',
    });
    expect(identify).toHaveBeenCalledTimes(1);
    expect(identify).toHaveBeenCalledWith({ campaign_id: 'letter-1' });
  });

  it('добавляет кампанию в identify пользователя и в продуктовые события', async () => {
    vi.stubEnv('VITE_ENABLE_PRODUCT_ANALYTICS', 'true');
    const track = vi.fn();
    const identify = vi.fn();
    const localStorage = createStorage();
    (globalThis as { window?: unknown }).window = {
      umami: { track, identify },
      localStorage,
      sessionStorage: createStorage(),
      navigator: {},
      matchMedia: () => ({ matches: false }),
      location: { search: '' },
    };

    captureCampaignAttribution('?campaign_id=letter-3');
    await trackUmamiSession(
      { id: 7, default_layout: 'tutor', onboarding_stage: 'done' } as UserData,
      'session_init',
    );

    expect(identify).toHaveBeenCalledWith('7', {
      user_id: 7,
      role: 'tutor',
      onboarding_stage: 'done',
      source: 'session_init',
      client_surface: 'web',
      campaign_id: 'letter-3',
    });

    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.AUTH_SIGNIN_SUCCEEDED, {
      source: 'signin_form',
    } as never);

    expect(track).toHaveBeenCalledWith(
      PRODUCT_ANALYTICS_EVENTS.CAMPAIGN_VISIT,
      expect.objectContaining({ campaign_id: 'letter-3' }),
    );
    expect(track).toHaveBeenCalledWith(
      PRODUCT_ANALYTICS_EVENTS.AUTH_SIGNIN_SUCCEEDED,
      expect.objectContaining({ campaign_id: 'letter-3' }),
    );

    vi.unstubAllEnvs();
  });

  it('забывает кампанию старше 30 дней', () => {
    const localStorage = createStorage();
    localStorage.setItem(CAMPAIGN_ID_STORAGE_KEY, 'old-letter');
    localStorage.setItem(CAMPAIGN_AT_STORAGE_KEY, String(Date.now() - 31 * 24 * 60 * 60 * 1000));
    (globalThis as { window?: unknown }).window = { localStorage, sessionStorage: createStorage() };

    expect(getCampaignId()).toBeUndefined();
    expect(localStorage.getItem(CAMPAIGN_ID_STORAGE_KEY)).toBeNull();
  });
});
