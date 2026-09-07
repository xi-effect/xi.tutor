import type { MathInterpreterModule } from '../core/types';

export const fractionInterpreter: MathInterpreterModule = {
  id: 'fraction-model',
  canInterpret(input) {
    const m = input.text.match(/\b(\d+)\s*\/\s*(\d+)\b/);
    if (!m) return 0;
    return Number(m[2]) > 0 && Number(m[1]) <= Number(m[2]) ? 0.88 : 0.65;
  },
  interpret(input) {
    const m = input.text.match(/\b(\d+)\s*\/\s*(\d+)\b/);
    if (!m || Number(m[2]) <= 0) return [];
    return [
      {
        id: 'fraction-model',
        label: 'Показать дробь',
        confidence: 0.88,
        intent: {
          type: 'fraction_model',
          numerator: Number(m[1]),
          denominator: Number(m[2]),
          model: 'bar',
        },
      },
    ];
  },
};
