import { getActivationFlowId } from './activationFlowId';
import { PRODUCT_ANALYTICS_EVENTS } from './events';

/** Ключи совпадают с ранним чтением в `apps/xi.web/index.html` (до старта приложения). */
export const CAMPAIGN_ID_STORAGE_KEY = 'sovlium_campaign_id';
export const CAMPAIGN_AT_STORAGE_KEY = 'sovlium_campaign_at';

const VISIT_PREFIX = 'sovlium_campaign_visit:';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CAMPAIGN_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

let umamiUserIdentified = false;
let queuedAnonymousCampaignId: string | null = null;

/** identify пользователя уже ушёл или вот-вот уйдёт — не затираем его данные кампанией. */
export function markUmamiUserIdentified(): void {
  umamiUserIdentified = true;
}

export function resetCampaignAttributionForTests(): void {
  umamiUserIdentified = false;
  queuedAnonymousCampaignId = null;
}

/** Короткий opaque id рассылки. Почта и свободный текст отбрасываются. */
export function normalizeCampaignId(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value).trim();
  } catch {
    return undefined;
  }
  if (!CAMPAIGN_ID_PATTERN.test(value)) return undefined;
  return value;
}

function campaignIdFromQuery(query: string): string | undefined {
  const normalized = query.startsWith('?') ? query.slice(1) : query;
  return normalizeCampaignId(new URLSearchParams(normalized).get('campaign_id'));
}

/** `campaign_id` из query или из вложенного `redirect` после редиректа на вход. */
export function campaignIdFromSearch(search: string): string | undefined {
  try {
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    const direct = normalizeCampaignId(params.get('campaign_id'));
    if (direct) return direct;

    const redirect = params.get('redirect');
    if (!redirect) return undefined;
    const queryIndex = redirect.indexOf('?');
    if (queryIndex === -1) return undefined;
    return campaignIdFromQuery(redirect.slice(queryIndex));
  } catch {
    return undefined;
  }
}

function readStoredCampaignId(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const id = normalizeCampaignId(window.localStorage.getItem(CAMPAIGN_ID_STORAGE_KEY));
    const at = Number(window.localStorage.getItem(CAMPAIGN_AT_STORAGE_KEY));
    if (!id || !Number.isFinite(at) || Date.now() - at > TTL_MS) {
      window.localStorage.removeItem(CAMPAIGN_ID_STORAGE_KEY);
      window.localStorage.removeItem(CAMPAIGN_AT_STORAGE_KEY);
      return undefined;
    }
    return id;
  } catch {
    return undefined;
  }
}

function persistCampaignId(id: string): void {
  try {
    window.localStorage.setItem(CAMPAIGN_ID_STORAGE_KEY, id);
    window.localStorage.setItem(CAMPAIGN_AT_STORAGE_KEY, String(Date.now()));
  } catch {
    // localStorage может быть недоступен — атрибуция останется только на этом хите.
  }
}

/** Кампания, с которой пользователь пришёл за последние 30 дней. */
export function getCampaignId(): string | undefined {
  return readStoredCampaignId();
}

export function getCampaignEventProps(): { campaign_id: string } | undefined {
  const campaignId = getCampaignId();
  return campaignId ? { campaign_id: campaignId } : undefined;
}

function rememberVisit(id: string): boolean {
  const key = `${VISIT_PREFIX}${id}`;
  try {
    if (window.sessionStorage.getItem(key) === '1') return false;
    window.sessionStorage.setItem(key, '1');
    return true;
  } catch {
    return true;
  }
}

function waitForUmami(maxAttempts = 50, interval = 100): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not available'));
      return;
    }
    if (window.umami) {
      resolve();
      return;
    }

    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts += 1;
      if (window.umami) {
        clearInterval(checkInterval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        reject(new Error('Umami script failed to load'));
      }
    }, interval);
  });
}

async function sendCampaignAttribution(
  campaignId: string,
  shouldTrackVisit: boolean,
  shouldIdentify: boolean,
): Promise<void> {
  try {
    await waitForUmami();
  } catch {
    return;
  }

  const umami = window.umami;
  if (!umami) return;

  if (shouldTrackVisit && typeof umami.track === 'function') {
    const activationFlowId = getActivationFlowId();
    try {
      umami.track(PRODUCT_ANALYTICS_EVENTS.CAMPAIGN_VISIT, {
        event_version: 1,
        campaign_id: campaignId,
        ...(activationFlowId ? { activation_flow_id: activationFlowId } : {}),
      });
    } catch {
      // Аналитика не должна ломать вход по ссылке из письма.
    }
  }

  if (shouldIdentify && !umamiUserIdentified && typeof umami.identify === 'function') {
    try {
      umami.identify({ campaign_id: campaignId });
    } catch {
      // ignore
    }
  }
}

/**
 * Запоминает `campaign_id` из адреса и помечает сессию Umami.
 * Событие визита отправляется один раз на вкладку и кампанию.
 * Сохранённый id ещё 30 дней добавляется к identify и продуктовым событиям.
 */
export function captureCampaignAttribution(search?: string): void {
  if (typeof window === 'undefined') return;

  const fromUrl = campaignIdFromSearch(search ?? window.location.search);
  if (fromUrl) persistCampaignId(fromUrl);

  const campaignId = fromUrl ?? readStoredCampaignId();
  if (!campaignId) return;

  const shouldTrackVisit = Boolean(fromUrl) && rememberVisit(campaignId);
  const shouldIdentify = !umamiUserIdentified && queuedAnonymousCampaignId !== campaignId;
  if (shouldIdentify) queuedAnonymousCampaignId = campaignId;
  void sendCampaignAttribution(campaignId, shouldTrackVisit, shouldIdentify);
}
