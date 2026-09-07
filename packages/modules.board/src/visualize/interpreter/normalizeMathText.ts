import { evaluateEquation } from '../../shapes/coordinate-axes/utils/evaluateEquation';
import { normalizeUnicodeMathText } from '../../shapes/text/utils/unicodeMath';

const SUPERSCRIPT_MAP: Record<string, string> = {
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
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
};

function unwrapLatexMath(text: string): string {
  let current = text;
  let previous = '';
  while (current !== previous) {
    previous = current;
    current = current
      .replace(/\\sqrt\[([^\]]+)\]\{([^{}]*)\}/g, '($2)^(1/$1)')
      .replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)')
      .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
      .replace(/\^\{([^{}]*)\}/g, '^($1)')
      .replace(/_\{([^{}]*)\}/g, '_$1');
  }
  return current
    .replace(/\\left|\\right/g, '')
    .replace(/\\times/g, '*')
    .replace(/\\cdot/g, '*')
    .replace(/\\circ\b/g, '°')
    .replace(/\\degree\b/g, '°')
    .replace(/\\(?:cos|sin|tan|cot|sec|csc)\b/gi, (command) => command.slice(1))
    .replace(/\\pi\b/g, 'pi')
    .replace(/\$+/g, ' ')
    .replace(/\\[()[\]]/g, ' ')
    .replace(/\^\(?°\)?/g, '°')
    .replace(/\^\(circ\)/gi, '°')
    .replace(/sqrt\((\d+(?:\.\d+)?)\.\)/g, 'sqrt($1)');
}

export function normalizeMathText(input: string): string {
  let text = input.replace(/\u00a0/g, ' ');

  text = text.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, (run) => {
    const mapped = [...run].map((char) => SUPERSCRIPT_MAP[char] ?? '').join('');
    if (!mapped) return '';
    return `^${mapped.length > 1 ? `(${mapped})` : mapped}`;
  });

  text = text.replace(/[₀₁₂₃₄₅₆₇₈₉]+/g, (run) =>
    [...run].map((char) => SUBSCRIPT_MAP[char] ?? '').join(''),
  );

  return unwrapLatexMath(text)
    .replace(/[×⋅·∗]/g, '*')
    .replace(/[−–—]/g, '-')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/у\s*=/gi, 'y =');
}

export function latinizeMathIdentifiers(expression: string): string {
  return expression.replace(/х/g, 'x').replace(/у/g, 'y');
}

export function trimMathExpression(expression: string): string {
  return expression.replace(/[\s.!;:,]+$/g, '').trim();
}

const MATH_TAIL = /(?:sqrt|sin|cos|tan|abs|ln|log|exp|[0-9a-zA-Z+\-*/^().,\s_])+$/i;

export function takeLeadingMath(expression: string): string {
  const latinized = latinizeMathIdentifiers(trimMathExpression(expression));
  const tail = latinized.match(MATH_TAIL);
  if (tail && /[0-9xX]/.test(tail[0])) {
    return trimMathExpression(tail[0]);
  }
  const match = latinized.match(/^[0-9a-zA-Z+\-*/^().,\s_]+/);
  return match ? trimMathExpression(match[0]) : '';
}

/** Приводит RHS графика к выражению, которое понимает coordinate-axes. */
export function toPlottableExpression(expression: string): string | null {
  const normalized = latinizeMathIdentifiers(
    trimMathExpression(normalizeMathText(normalizeUnicodeMathText(expression))),
  );
  const candidates = [takeLeadingMath(normalized), normalized].filter(
    (value, index, all): value is string => Boolean(value) && all.indexOf(value) === index,
  );

  for (const candidate of candidates) {
    if (evaluateEquation(candidate).ok) return candidate;
  }

  return null;
}

const DISPLAY_SUPERSCRIPT: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

export function toDisplayMath(expression: string): string {
  return expression.replace(
    /\^(\d)/g,
    (_, digit: string) => DISPLAY_SUPERSCRIPT[digit] ?? `^${digit}`,
  );
}
