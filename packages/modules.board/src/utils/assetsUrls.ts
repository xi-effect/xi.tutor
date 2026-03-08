import type { TLUiAssetUrlOverrides } from 'tldraw';

type MakeTldrawAssetUrlsConfig = {
  baseUrl: string;
  // если у тебя другая структура папок — можно переопределить
  folders?: Partial<{
    fonts: string;
    icons: string;
    translations: string;
    embedIcons: string;
  }>;
  // если расширения у тебя другие — можно переопределить
  exts?: Partial<{
    fonts: string;
    icons: string;
    translations: string;
    embedIcons: string;
  }>;
};

/**
 * Делает TLUiAssetUrlOverrides из одного baseUrl.
 * Работает без перечисления ключей (через Proxy).
 */
export function makeTldrawAssetUrls(config: MakeTldrawAssetUrlsConfig): TLUiAssetUrlOverrides {
  const baseUrl = config.baseUrl.replace(/\/+$/, ''); // без trailing /
  const folders = {
    fonts: 'fonts',
    icons: 'icons',
    translations: 'translations',
    embedIcons: 'embed-icons',
    ...config.folders,
  };
  const exts = {
    fonts: 'woff2',
    icons: 'svg',
    translations: 'json',
    embedIcons: 'svg',
    ...config.exts,
  };

  const makeGroupProxy = (group: keyof typeof folders) =>
    new Proxy(
      {},
      {
        get(_target, prop) {
          // tldraw может читать служебные штуки типа Symbol.toStringTag
          if (typeof prop !== 'string') return undefined;

          // важно: encodeURIComponent на случай "gu-in" / "pt-br" и т.п.
          const name = encodeURIComponent(prop);
          return `${baseUrl}/${folders[group]}/${name}.${exts[group]}`;
        },
      },
    ) as Record<string, string>;

  return {
    fonts: makeGroupProxy('fonts'),
    icons: makeGroupProxy('icons'),
    translations: makeGroupProxy('translations'),
    embedIcons: makeGroupProxy('embedIcons'),
  };
}
