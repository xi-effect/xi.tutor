import { APP_HOST, APP_ORIGIN } from '../shared/constants';
import { getAllowedDevOrigins, isDev } from './config';

const SAFE_EXTERNAL_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tg:', 'telegram:']);

export function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function isSovliumHost(host: string): boolean {
  const normalized = host.trim().replace(/\.$/, '').toLowerCase();
  return normalized === 'sovlium.ru' || normalized.endsWith('.sovlium.ru');
}

export function isAllowedNavigation(urlString: string): boolean {
  const url = parseUrl(urlString);
  if (!url) return false;

  if (url.protocol === 'https:' && url.hostname === APP_HOST) return true;
  if (url.protocol === 'about:') return true;
  if (url.protocol === 'blob:' || url.protocol === 'data:') return true;

  if (isDev() && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
    return url.protocol === 'http:' || url.protocol === 'https:';
  }

  return false;
}

export function isTrustedRendererOrigin(origin: string): boolean {
  if (origin === APP_ORIGIN) return true;
  if (isDev() && getAllowedDevOrigins().includes(origin)) return true;
  return false;
}

export function isTrustedRendererUrl(urlString: string): boolean {
  const url = parseUrl(urlString);
  if (!url) return false;
  return isTrustedRendererOrigin(url.origin);
}

export function isSafeExternalUrl(urlString: string): boolean {
  const url = parseUrl(urlString);
  if (!url) return false;
  return SAFE_EXTERNAL_SCHEMES.has(url.protocol);
}

export function toDeepLinkPath(urlString: string): string | null {
  const url = parseUrl(urlString);
  if (!url) return null;
  if (url.protocol !== 'sovlium:') return null;
  const path = `${url.hostname}${url.pathname}`.replace(/\/+$/, '');
  const search = url.search;
  const normalized = `/${path}`.replace(/\/{2,}/g, '/');
  return `${normalized}${search}`;
}
