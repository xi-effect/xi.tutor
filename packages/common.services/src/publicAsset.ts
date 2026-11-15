const PUBLIC_ASSET_PREFIXES = ['/assets/', '/demo-board/'] as const;

const hasPublicPrefix = (pathname: string): boolean =>
  PUBLIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix));

/** Статический файл приложения, его можно показать без токена хранилища. */
export const isPublicAssetSrc = (src: string): boolean => {
  if (!src) return false;
  if (hasPublicPrefix(src)) return true;
  try {
    return hasPublicPrefix(new URL(src).pathname);
  } catch {
    return false;
  }
};
