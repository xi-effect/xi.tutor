import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ActivitySessionProvider } from '../activityHost';
import { ActivityImage } from '../ActivityImage';

function renderImage(src?: string) {
  const previous = globalThis.window;
  globalThis.window = { devicePixelRatio: 2 } as Window & typeof globalThis;
  try {
    return renderToStaticMarkup(
      createElement(
        ActivitySessionProvider,
        { token: 'token' },
        createElement(ActivityImage, { src, alt: 'pic', className: 'size-8' }),
      ),
    );
  } finally {
    globalThis.window = previous;
  }
}

describe('ActivityImage вне холста', () => {
  it('рендерится в заметках без Draw', () => {
    const html = renderImage('file-1');
    expect(html).toContain('<img');
    expect(html).toContain('size-8');
  });

  it('не рисует рамку, если картинки нет', () => {
    expect(renderImage(undefined)).toBe('');
  });
});
