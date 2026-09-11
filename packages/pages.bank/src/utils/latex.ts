const LATEX_SEGMENT = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^$\n]+?)\$/g;

const SUPER_TO_LATEX: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁺': '+',
  '⁻': '-',
  '⁽': '(',
  '⁾': ')',
  ⁿ: 'n',
};

const MATH_RUN = /[0-9A-Za-z()[\]+\-*=<>^_./\\⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁽⁾ⁿ]+/g;
const HAS_MATH_MARKER = /[\^_⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ⁽⁾]/;

export type MathTextPart =
  { type: 'text'; value: string } | { type: 'math'; value: string; display: boolean };

const consumeBalanced = (value: string, start: number, open: string, close: string) => {
  if (value[start] !== open) {
    return start;
  }

  let depth = 0;
  for (let index = start; index < value.length; index += 1) {
    const char = value[index];
    if (char === open) {
      depth += 1;
    } else if (char === close) {
      depth -= 1;
      if (depth === 0) {
        return index + 1;
      }
    }
  }

  return value.length;
};

const consumeLatexAtom = (value: string, start: number) => {
  if (value[start] !== '\\' || !/[a-zA-Z]/.test(value[start + 1] ?? '')) {
    return start;
  }

  let index = start + 1;
  while (index < value.length && /[a-zA-Z]/.test(value[index])) {
    index += 1;
  }
  if (value[index] === '*') {
    index += 1;
  }

  while (index < value.length && (value[index] === '{' || value[index] === '[')) {
    index = consumeBalanced(value, index, value[index], value[index] === '{' ? '}' : ']');
  }

  return index;
};

const looksLikePlainMath = (value: string) =>
  HAS_MATH_MARKER.test(value) || (value.includes('=') && /\d/.test(value));

const asciiToLatex = (value: string) =>
  value
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁽⁾ⁿ]+/g, (run) => {
      const exponent = [...run].map((char) => SUPER_TO_LATEX[char] ?? char).join('');
      return `^{${exponent}}`;
    })
    .replace(/\^(\([^)]+\))/g, '^{$1}')
    .replace(/\^([A-Za-z0-9]+)/g, '^{$1}');

const splitPlainMath = (value: string): MathTextPart[] => {
  const parts: MathTextPart[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(MATH_RUN)) {
    const chunk = match[0];
    const from = match.index ?? 0;
    const trailing = chunk.match(/[.,;:]+$/)?.[0] ?? '';
    const formula = trailing ? chunk.slice(0, -trailing.length) : chunk;
    if (!formula || !looksLikePlainMath(formula)) {
      continue;
    }

    if (from > lastIndex) {
      parts.push({ type: 'text', value: value.slice(lastIndex, from) });
    }
    parts.push({ type: 'math', value: asciiToLatex(formula), display: false });
    lastIndex = from + formula.length;
  }

  if (lastIndex < value.length) {
    parts.push({ type: 'text', value: value.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: 'text', value }];
};

const splitUnwrappedLatex = (value: string): MathTextPart[] => {
  if (!value.includes('\\')) {
    return splitPlainMath(value);
  }

  const parts: MathTextPart[] = [];
  let lastIndex = 0;
  let index = 0;

  while (index < value.length) {
    if (value[index] === '\\' && /[a-zA-Z]/.test(value[index + 1] ?? '')) {
      const end = consumeLatexAtom(value, index);
      if (end > index) {
        if (index > lastIndex) {
          parts.push(...splitPlainMath(value.slice(lastIndex, index)));
        }
        parts.push({ type: 'math', value: value.slice(index, end), display: false });
        lastIndex = end;
        index = end;
        continue;
      }
    }

    index += 1;
  }

  if (lastIndex < value.length) {
    parts.push(...splitPlainMath(value.slice(lastIndex)));
  }

  return parts.length ? parts : [{ type: 'text', value }];
};

export const splitMathText = (value: string): MathTextPart[] => {
  const parts: MathTextPart[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(LATEX_SEGMENT)) {
    const from = match.index ?? 0;
    if (from > lastIndex) {
      parts.push(...splitUnwrappedLatex(value.slice(lastIndex, from)));
    }

    const display = Boolean(match[1] || match[2]);
    const latex = match[1] ?? match[2] ?? match[3] ?? match[4] ?? '';
    parts.push({ type: 'math', value: latex, display });
    lastIndex = from + match[0].length;
  }

  if (lastIndex < value.length) {
    parts.push(...splitUnwrappedLatex(value.slice(lastIndex)));
  }

  return parts.length ? parts : [{ type: 'text', value }];
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Текст условия без обёрток `$...$` — для вставок, где формулы не рендерятся. */
export const statementToReadableText = (text: string) =>
  splitMathText(text)
    .map((part) => part.value)
    .join('');

/** HTML с inline-math, который доска превращает в формулы TipTap. */
export const statementToInlineMathHtml = (text: string) => {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  return lines
    .map((line) => {
      const body = splitMathText(line)
        .map((part) => {
          if (part.type === 'text') {
            return escapeHtml(part.value);
          }
          const latex = escapeHtml(part.value);
          return `<span data-type="inline-math" data-latex="${latex}" class="tiptap-mathematics-render">${latex}</span>`;
        })
        .join('');
      return `<p>${body}</p>`;
    })
    .join('');
};

export const statementToBoardRichText = (text: string) => ({
  type: 'doc' as const,
  content: text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => {
      const content: Array<
        { type: 'text'; text: string } | { type: 'inlineMath'; attrs: { latex: string } }
      > = [];

      for (const part of splitMathText(line)) {
        if (part.type === 'text') {
          if (part.value) {
            content.push({ type: 'text', text: part.value });
          }
        } else {
          content.push({ type: 'inlineMath', attrs: { latex: part.value } });
        }
      }

      return { type: 'paragraph' as const, content };
    }),
});
