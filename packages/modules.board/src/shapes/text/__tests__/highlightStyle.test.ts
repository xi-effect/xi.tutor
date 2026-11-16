import { describe, expect, it } from 'vitest';
import type { DrRichTextWithNodesT, RichNodeT } from '../types';
import {
  applyHighlightStyle,
  hasHighlightMark,
  highlightBackgroundCss,
  LEGACY_TEXT_HIGHLIGHT,
  readCommonHighlightStyle,
  removeHighlight,
  renderHighlightHTML,
  updateExistingHighlight,
} from '../highlightStyle';

const text = (value: string, marks?: RichNodeT['marks']): RichNodeT => ({
  type: 'text',
  text: value,
  ...(marks ? { marks } : {}),
});

const doc = (nodes: RichNodeT[]): DrRichTextWithNodesT => ({
  type: 'doc',
  content: [
    { type: 'paragraph', content: nodes },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [text('пункт', [{ type: 'bold' }])],
            },
          ],
        },
      ],
    },
  ],
});

describe('highlight style', () => {
  it('собирает полупрозрачный фон из токена палитры', () => {
    expect(highlightBackgroundCss({ color: 'yellow', opacity: 100 })).toBe('var(--xi-yellow-100)');
    expect(highlightBackgroundCss({ color: 'green', opacity: 40 })).toBe(
      'color-mix(in srgb, var(--xi-green-80) 40%, transparent)',
    );
  });

  it('не рисует фон у старой метки без цвета', () => {
    expect(renderHighlightHTML({})).toEqual({});
    expect(renderHighlightHTML({ color: 'blue', opacity: '60' })).toMatchObject({
      'data-color': 'blue',
      'data-opacity': '60',
    });
  });

  it('обновляет только уже выделенный текст и сохраняет остальные метки', () => {
    const source = [
      doc([text('важно', [{ type: 'italic' }, { type: 'highlight' }]), text(' и ещё')]),
    ];
    const updated = updateExistingHighlight(source, { color: 'red', opacity: 40 });
    const paragraph = updated[0]?.content[0];
    const nested = updated[0]?.content[1]?.content?.[0]?.content?.[0]?.content?.[0];

    expect(paragraph?.content?.[0]?.marks).toEqual([
      { type: 'italic' },
      { type: 'highlight', attrs: { color: 'red', opacity: '40' } },
    ]);
    expect(paragraph?.content?.[1]?.marks).toBeUndefined();
    expect(nested?.marks).toEqual([{ type: 'bold' }]);
    expect(readCommonHighlightStyle(updated)).toEqual({ color: 'red', opacity: 40 });
    expect(source[0]?.content[0]?.content?.[0]?.marks?.[1]).toEqual({ type: 'highlight' });
  });

  it('кисть закрашивает весь текст, а снятие оставляет другие метки', () => {
    const source = [doc([text('важно', [{ type: 'italic' }])])];
    const painted = applyHighlightStyle(source, { color: 'yellow', opacity: 100 });

    expect(hasHighlightMark(painted)).toBe(true);
    expect(readCommonHighlightStyle(painted)).toEqual(LEGACY_TEXT_HIGHLIGHT);

    const cleared = removeHighlight(painted);
    expect(hasHighlightMark(cleared)).toBe(false);
    expect(cleared[0]?.content[0]?.content?.[0]?.marks).toEqual([{ type: 'italic' }]);
    expect(cleared[0]?.content[1]?.content?.[0]?.content?.[0]?.content?.[0]?.marks).toEqual([
      { type: 'bold' },
    ]);
  });

  it('старое выделение без атрибутов читается как жёлтое', () => {
    expect(readCommonHighlightStyle([doc([text('важно', [{ type: 'highlight' }])])])).toEqual(
      LEGACY_TEXT_HIGHLIGHT,
    );
    expect(readCommonHighlightStyle([doc([text('важно')])])).toBeNull();
  });
});
