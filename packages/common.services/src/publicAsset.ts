/** Статический файл приложения, его можно показать без токена хранилища. */
export const isPublicAssetSrc = (src: string): boolean => {
  if (!src) return false;
  if (src.startsWith('/assets/')) return true;
  try {
    return new URL(src).pathname.startsWith('/assets/');
  } catch {
    return false;
  }
};
