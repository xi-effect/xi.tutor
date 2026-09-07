import { describe, expect, it } from 'vitest';
import {
  extractLatexFromHtml,
  mathMlToLatex,
  pastedMathToRichHtml,
  reconstructPastedMath,
} from '../utils/clipboardMath';
import {
  findInlineMathSegments,
  getInlineMathNearSelection,
  latexFromSelectedText,
} from '../utils/mathLatex';
import { CASES_TEMPLATE, MATRIX_TEMPLATES, searchMathCommands } from '../mathCommands';

describe('latexFromSelectedText', () => {
  it('собирает дробь из a/b', () => {
    expect(latexFromSelectedText('1/2', 'fraction')).toBe('\\frac{1}{2}');
  });

  it('подставляет шаблон для пустой дроби', () => {
    expect(latexFromSelectedText('', 'fraction')).toBe('\\frac{a}{b}');
  });

  it('оборачивает выделенный текст как latex', () => {
    expect(latexFromSelectedText('x^2 + 1', 'wrap')).toBe('x^2 + 1');
  });

  it('не превращает обычные слова в формулу', () => {
    expect(latexFromSelectedText('ass', 'wrap')).toBe('');
    expect(latexFromSelectedText('просто текст', 'wrap')).toBe('');
  });

  it('снимает обёртку $...$ при вставке в latex', () => {
    expect(latexFromSelectedText('$E = mc^2$', 'wrap')).toBe('E = mc^2');
  });
});

describe('math command palette', () => {
  it('ищет школьные символы по русским названиям', () => {
    expect(searchMathCommands('перпендикуляр')[0]?.latex).toBe('\\perp');
    expect(searchMathCommands('бесконечность')[0]?.latex).toBe('\\infty');
    expect(searchMathCommands('меньше или равно')[0]?.latex).toBe('\\le');
  });

  it('предоставляет системы и основные размеры матриц', () => {
    expect(CASES_TEMPLATE).toContain('\\begin{cases}');
    expect(Object.keys(MATRIX_TEMPLATES)).toEqual(['2×2', '2×3', '3×2', '3×3']);
  });
});

describe('getInlineMathNearSelection', () => {
  it('берёт формулу слева от каретки', () => {
    const nearby = getInlineMathNearSelection({
      state: {
        doc: {
          nodeAt: (pos: number) =>
            pos === 10
              ? { type: { name: 'inlineMath' }, attrs: { latex: '\\sqrt{x}' }, nodeSize: 1 }
              : null,
        },
        selection: { from: 11, to: 11 },
      },
    });
    expect(nearby).toEqual({ pos: 10, latex: '\\sqrt{x}' });
  });
});

describe('findInlineMathSegments', () => {
  it('находит формулу в одинарных долларах', () => {
    expect(findInlineMathSegments('корень уравнения $2^{-4-x} = 16.$')).toEqual([
      { from: 17, to: 33, latex: '2^{-4-x} = 16.' },
    ]);
  });

  it('находит \\( ... \\)', () => {
    expect(findInlineMathSegments('y = \\(x^2\\)')).toEqual([{ from: 4, to: 11, latex: 'x^2' }]);
  });

  it('не считает валюту $100$ формулой', () => {
    expect(findInlineMathSegments('цена $100$')).toEqual([]);
  });

  it('собирает формулу ФИПИ из юникода MathJax', () => {
    const pasted =
      'Найдите корень уравнения 2−\u2009\u20624\u2062\u2009−\u2009\u2062𝑥\u2062\u200a =16';
    expect(findInlineMathSegments(pasted)).toEqual([
      {
        from: 25,
        to: pasted.length,
        latex: '2^{-4-x}=16',
      },
    ]);
  });

  it('собирает корень из символа √ без черты MathJax', () => {
    const pasted = 'Найдите корень уравнения √ 9x — 47 = 4';
    expect(findInlineMathSegments(pasted)).toEqual([
      {
        from: pasted.indexOf('√'),
        to: pasted.length,
        latex: '\\sqrt{9x-47}=4',
      },
    ]);
  });
});

describe('clipboard MathML / ФИПИ', () => {
  it('достаёт TeX из annotation', () => {
    const html =
      '<math><semantics><mrow></mrow><annotation encoding="application/x-tex">2^{-4-x}=16</annotation></semantics></math>';
    expect(extractLatexFromHtml(html)).toEqual(['2^{-4-x}=16']);
  });

  it('собирает LaTeX из msqrt', () => {
    const mathMl =
      '<math xmlns="http://www.w3.org/1998/Math/MathML"><msqrt><mn>9</mn><mi>𝑥</mi><mo>−</mo><mn>47</mn></msqrt><mo>=</mo><mn>4</mn></math>';
    expect(mathMlToLatex(mathMl)).toBe('\\sqrt{9x-47}=4');
  });

  it('собирает LaTeX из msup', () => {
    const mathMl =
      '<math xmlns="http://www.w3.org/1998/Math/MathML"><msup><mn>2</mn><mrow><mo>−</mo><mn>4</mn><mo>−</mo><mi>𝑥</mi></mrow></msup><mo>=</mo><mn>16</mn></math>';
    expect(mathMlToLatex(mathMl)).toBe('{2}^{-4-x}=16');
  });

  it('подставляет TeX из html в текст ФИПИ', () => {
    const plain =
      'Найдите корень уравнения 2−\u2009\u20624\u2062\u2009−\u2009\u2062𝑥\u2062\u200a =16';
    const html = '<math><annotation encoding="application/x-tex">2^{-4-x}=16</annotation></math>';
    expect(reconstructPastedMath(plain, html)).toBe('Найдите корень уравнения $2^{-4-x}=16$');
  });

  it('собирает html инлайн-формулы без html ФИПИ', () => {
    const plain =
      'Найдите корень уравнения 2−\u2009\u20624\u2062\u2009−\u2009\u2062𝑥\u2062\u200a =16';
    expect(pastedMathToRichHtml(plain)).toBe(
      '<p>Найдите корень уравнения <span data-type="inline-math" data-latex="2^{-4-x}=16" class="tiptap-mathematics-render">2^{-4-x}=16</span></p>',
    );
  });
});
