import type { MathInterpreterModule } from '../core/types';

function nums(text: string) {
  const listed = text.match(
    /(?:последовательн[а-я]*|прогресси[а-я]*|ряд(?:\s+чисел)?|числа(?:\s+последовательности)?)[:\s]+(-?\d+(?:[.,]\d+)?(?:\s*[,;]\s*-?\d+(?:[.,]\d+)?)+)/i,
  );
  const source = listed?.[1] ?? text.match(/(-?\d+(?:[.,]\d+)?(?:\s*[,;]\s*-?\d+(?:[.,]\d+)?){3,})/)?.[1];
  if (!source) return [];
  return [...source.matchAll(/-?\d+(?:[.,]\d+)?/g)].map((match) => Number(match[0].replace(',', '.')));
}

export const sequenceInterpreter: MathInterpreterModule = {
  id: 'sequence',
  canInterpret(input) {
    const values = nums(input.text);
    return values.length >= 4 && /(последовательн|прогресси|ряд|числа)/i.test(input.text)
      ? 0.86
      : 0;
  },
  interpret(input) {
    const values = nums(input.text);
    if (values.length < 4) return [];
    const d = values[1] - values[0];
    const arithmetic = values.slice(1).every((value, index) => Math.abs(value - values[index] - d) < 1e-9);
    const q = values[0] !== 0 ? values[1] / values[0] : NaN;
    const geometric =
      Number.isFinite(q) &&
      values.slice(1).every((value, index) => values[index] !== 0 && Math.abs(value / values[index] - q) < 1e-9);
    return [
      {
        id: 'sequence',
        label: 'Визуализировать последовательность',
        confidence: 0.86,
        intent: {
          type: 'sequence',
          values,
          kind: arithmetic ? 'arithmetic' : geometric ? 'geometric' : 'generic',
        },
      },
    ];
  },
};
