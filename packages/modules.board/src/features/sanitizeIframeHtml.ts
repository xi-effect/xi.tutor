/**
 * Разрешаемые атрибуты iframe при вставке HTML (безопасный подмножество).
 */
const ALLOWED_IFRAME_ATTRS = [
  'src',
  'width',
  'height',
  'allow',
  'sandbox',
  'referrerpolicy',
  'title',
  'loading',
] as const;

function isAllowedSrc(href: string): boolean {
  try {
    const url = new URL(href);
    const p = url.protocol.toLowerCase();
    return p === 'http:' || p === 'https:';
  } catch {
    return false;
  }
}

/**
 * Извлекает первый iframe из HTML и возвращает безопасный HTML только с разрешёнными атрибутами.
 * src проверяется на http/https. Возвращает пустую строку, если iframe не найден или src недопустим.
 */
export function sanitizeIframeHtml(input: string): { html: string; src: string } | null {
  const trimmed = input.trim();
  if (!trimmed || !trimmed.toLowerCase().includes('<iframe')) {
    return null;
  }

  try {
    const doc = new DOMParser().parseFromString(trimmed, 'text/html');
    const iframe = doc.querySelector('iframe');
    if (!iframe || !iframe.getAttribute('src')) {
      return null;
    }

    const src = (iframe.getAttribute('src') || '').trim();
    if (!isAllowedSrc(src)) {
      return null;
    }

    const safe = document.createElement('iframe');
    for (const attr of ALLOWED_IFRAME_ATTRS) {
      const val = iframe.getAttribute(attr);
      if (val != null && val !== '') {
        safe.setAttribute(attr, val);
      }
    }
    // Для рендера в контейнере задаём размеры через класс
    if (!safe.hasAttribute('width')) safe.setAttribute('width', '100%');
    if (!safe.hasAttribute('height')) safe.setAttribute('height', '100%');

    return { html: safe.outerHTML, src };
  } catch {
    return null;
  }
}
