import type { MathInterpreterModule } from '../core/types';

export const ratioInterpreter: MathInterpreterModule = {
  id: 'ratio',
  canInterpret(input) {
    return /\b\d+(?:[.,]\d+)?\s*:\s*\d+(?:[.,]\d+)?\b/.test(input.text) ? 0.85 : 0;
  },
  interpret(input) {
    const m = input.text.match(/\b(\d+(?:[.,]\d+)?)\s*:\s*(\d+(?:[.,]\d+)?)\b/);
    return m
      ? [
          {
            id: 'ratio',
            label: 'Показать отношение',
            confidence: 0.85,
            intent: {
              type: 'ratio',
              left: Number(m[1].replace(',', '.')),
              right: Number(m[2].replace(',', '.')),
            },
          },
        ]
      : [];
  },
};

export const percentInterpreter: MathInterpreterModule = {
  id: 'percent',
  canInterpret(input) {
    return /\b\d+(?:[.,]\d+)?\s*%/.test(input.text) ? 0.82 : 0;
  },
  interpret(input) {
    const m = input.text.match(/\b(\d+(?:[.,]\d+)?)\s*%/);
    return m
      ? [
          {
            id: 'percent',
            label: 'Показать процент',
            confidence: 0.82,
            intent: { type: 'percent_bar', percent: Number(m[1].replace(',', '.')) },
          },
        ]
      : [];
  },
};
