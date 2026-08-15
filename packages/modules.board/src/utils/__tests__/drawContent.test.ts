import { describe, expect, it } from 'vitest';
import { deserializeDrawContent, serializeDrawContent } from '../drawContent';

describe('drawContent', () => {
  it('сериализует и восстанавливает контент', () => {
    const content = {
      shapes: [{ id: 'shape:1', type: 'geo' }],
      assets: [{ id: 'asset:1' }],
    };

    const html = serializeDrawContent(content as never);
    expect(html).toContain('data-draw');
    expect(html).toContain('application/draw');

    expect(deserializeDrawContent(html)).toEqual(content);
  });

  it('возвращает null на мусор', () => {
    expect(deserializeDrawContent('<p>hello</p>')).toBeNull();
  });
});
