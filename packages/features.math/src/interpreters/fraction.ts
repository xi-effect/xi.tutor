import type { MathInterpreterModule } from '../core/types';

const FRACTION_HINT = /дроб|числител|знаменател|закрась|модель/;

function parseFraction(text: string): { numerator: number; denominator: number } | null {
  const standalone = text.trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  const hinted = FRACTION_HINT.test(text.toLowerCase())
    ? text.match(/\b(\d+)\s*\/\s*(\d+)\b/)
    : standalone;
  const match = hinted ?? standalone;
  if (!match || Number(match[2]) <= 0) return null;
  return { numerator: Number(match[1]), denominator: Number(match[2]) };
}

export const fractionInterpreter: MathInterpreterModule = {
  id: 'fraction-model',
  canInterpret(input) {
    const parsed = parseFraction(input.text);
    if (!parsed) return 0;
    return parsed.numerator <= parsed.denominator ? 0.88 : 0.65;
  },
  interpret(input) {
    const parsed = parseFraction(input.text);
    if (!parsed) return [];
    return [
      {
        id: 'fraction-model',
        label: 'Показать дробь',
        confidence: 0.88,
        intent: {
          type: 'fraction_model',
          numerator: parsed.numerator,
          denominator: parsed.denominator,
          model: 'bar',
        },
      },
    ];
  },
};
