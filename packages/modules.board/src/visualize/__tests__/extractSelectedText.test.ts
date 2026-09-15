import { describe, expect, it } from 'vitest';
import {
  pickVisualizationText,
  visualizationTextFromHtml,
  visualizationTextFromRichText,
} from '../extractSelectedText';

describe('visualizationTextFromRichText', () => {
  it('вставляет latex инлайн-формул, а не выкидывает их', () => {
    const text = visualizationTextFromRichText({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'В треугольнике ' },
            { type: 'inlineMath', attrs: { latex: 'ABC' } },
            { type: 'text', text: ' угол ' },
            { type: 'inlineMath', attrs: { latex: 'C' } },
            { type: 'text', text: ' равен ' },
            { type: 'inlineMath', attrs: { latex: '90^\\circ, AB = 10, BC = \\sqrt{19}' } },
            { type: 'text', text: '. Найдите ' },
            { type: 'inlineMath', attrs: { latex: '\\cos A' } },
            { type: 'text', text: '.' },
          ],
        },
      ],
    });

    expect(text).toContain('ABC');
    expect(text).toContain('90^\\circ');
    expect(text).toContain('\\sqrt{19}');
    expect(text).toMatch(/угол\s*C\s*равен/);
  });

  it('склеивает соседние однобуквенные формулы в имя точки', () => {
    const text = visualizationTextFromRichText({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Отрезки ' },
            { type: 'inlineMath', attrs: { latex: 'A' } },
            { type: 'inlineMath', attrs: { latex: 'C' } },
            { type: 'text', text: ' и ' },
            { type: 'inlineMath', attrs: { latex: 'B' } },
            { type: 'inlineMath', attrs: { latex: 'D' } },
            { type: 'text', text: ' — диаметры' },
          ],
        },
      ],
    });
    expect(text).toContain('AC');
    expect(text).toContain('BD');
  });

  it('берёт latex из любого узла с attrs.latex', () => {
    const text = visualizationTextFromRichText({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'В треугольнике ' },
            { type: 'math', attrs: { latex: 'ABC' } },
          ],
        },
      ],
    });
    expect(text).toContain('ABC');
  });
});

describe('pickVisualizationText', () => {
  it('предпочитает вариант с формулами, а не обрезанный plaintext', () => {
    const picked = pickVisualizationText([
      'В треугольнике  угол  равен . Найдите .',
      'В треугольнике ABC угол C равен 90^\\circ, AB = 10, BC = \\sqrt{19}. Найдите \\cos A.',
    ]);
    expect(picked).toContain('ABC');
    expect(picked).toContain('\\sqrt{19}');
  });
});

describe('visualizationTextFromHtml', () => {
  it('достаёт data-latex из KaTeX-span', () => {
    const text = visualizationTextFromHtml(
      '<p>В треугольнике <span data-type="inline-math" data-latex="ABC">ABC</span> угол</p>',
    );
    expect(text).toContain('ABC');
    expect(text).toContain('треугольнике');
  });

  it('не размазывает буквы по вложенным span KaTeX', () => {
    const text = visualizationTextFromHtml(
      '<p>Отрезки <span data-type="inline-math" data-latex="AC" class="tiptap-mathematics-render"><span class="katex"><span class="mord">A</span><span class="mord">C</span></span></span> и <span data-type="inline-math" data-latex="BD"><span class="mord">B</span><span class="mord">D</span></span> диаметры</p>',
    );
    expect(text).toMatch(/\bAC\b/);
    expect(text).toMatch(/\bBD\b/);
    expect(text).not.toMatch(/A C/);
  });
});
