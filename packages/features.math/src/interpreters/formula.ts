import type { MathInterpreterModule } from '../core/types';

function extractFormulaSource(text: string): string {
  return text
    .trim()
    .replace(/^(?:формула|запишите\s+выражение|оформите)\s*:\s*/i, '')
    .trim();
}

export const formulaInterpreter: MathInterpreterModule = {
  id: 'formula',
  canInterpret(input) {
    if (input.latex?.trim()) return 0.99;
    const t = extractFormulaSource(input.text);
    if (/^[\d\sa-zA-Z()+\-*/^=<>≤≥.,]+$/i.test(t) && /[=^<>≤≥]/.test(t)) return 0.7;
    return 0;
  },
  interpret(input) {
    if (!this.canInterpret(input)) return [];
    const source = extractFormulaSource(input.text);
    return [
      {
        id: 'formula',
        label: 'Оформить как формулу',
        confidence: input.latex ? 0.99 : 0.7,
        intent: { type: 'formula', source, latex: input.latex },
      },
    ];
  },
};
