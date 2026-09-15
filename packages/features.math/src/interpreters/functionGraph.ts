import type { MathInterpreterModule } from '../core/types';
import { normalizeMathText, takeMathRhs } from '../utils/normalize';

const fnRegex = /(?:\b(?:y|[a-zA-Z]\w*\(x\))\s*=\s*)([^\n;,]+(?:[+\-*/^()]\s*[^\n;,]+)*)/gi;

export const functionGraphInterpreter: MathInterpreterModule = {
  id: 'function-graph',
  canInterpret(input) {
    const t = normalizeMathText(input.text);
    return /\b(?:y|[a-zA-Z]\w*\(x\))\s*=/.test(t) ? 0.98 : 0;
  },
  interpret(input) {
    const text = normalizeMathText(input.text);
    const expressions: Array<{ label?: string; expression: string }> = [];
    for (const match of text.matchAll(fnRegex)) {
      const full = match[0];
      const eq = full.indexOf('=');
      const lhs = full.slice(0, eq).trim();
      const expression = takeMathRhs(full.slice(eq + 1));
      if (expression) expressions.push({ label: lhs, expression });
    }
    if (!expressions.length) return [];
    return [
      {
        id: 'function-graph',
        label: expressions.length > 1 ? 'Построить графики' : 'Построить график',
        confidence: 0.98,
        intent: { type: 'function_graph', expressions },
      },
    ];
  },
};
