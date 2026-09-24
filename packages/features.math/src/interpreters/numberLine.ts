import type { MathInterpreterModule, NumberLineIntent } from '../core/types';
import { normalizeMathText } from '../utils/normalize';

function parseSingle(text: string): NumberLineIntent | null {
  const chained = text.match(
    /(-?\d+(?:[.,]\d+)?)\s*(<|<=|≤)\s*x\s*(<|<=|≤)\s*(-?\d+(?:[.,]\d+)?)/i,
  );
  if (chained) {
    return {
      type: 'number_line',
      intervals: [
        {
          from: Number(chained[1].replace(',', '.')),
          to: Number(chained[4].replace(',', '.')),
          fromInclusive: chained[2] !== '<',
          toInclusive: chained[3] !== '<',
        },
      ],
    };
  }
  const m = text.match(/\bx\s*(>=|<=|>|<|≥|≤)\s*(-?\d+(?:[.,]\d+)?)/i);
  if (!m) return null;
  const n = Number(m[2].replace(',', '.'));
  const op = m[1];
  if (op === '>' || op === '>= ' || op === '≥' || op === '>=') {
    return {
      type: 'number_line',
      intervals: [{ from: n, to: null, fromInclusive: op !== '>', toInclusive: false }],
    };
  }
  return {
    type: 'number_line',
    intervals: [{ from: null, to: n, fromInclusive: false, toInclusive: op !== '<' }],
  };
}

export const numberLineInterpreter: MathInterpreterModule = {
  id: 'number-line',
  canInterpret(input) {
    return parseSingle(normalizeMathText(input.text)) ? 0.92 : 0;
  },
  interpret(input) {
    const intent = parseSingle(normalizeMathText(input.text));
    return intent
      ? [{ id: 'number-line', label: 'Показать на числовой прямой', confidence: 0.92, intent }]
      : [];
  },
};
