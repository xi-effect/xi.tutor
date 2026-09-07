import { evaluateEquation } from '../../shapes/coordinate-axes/utils/evaluateEquation';
import type { LegacyVisualizationSuggestion } from '../types';
import { normalizeMathText, takeLeadingMath, toDisplayMath } from './normalizeMathText';

const EQUATION_LINE = /(?:^|\n)\s*([^\n=]{1,80})=\s*([^\n]{1,40})\s*(?=$|\n)/g;

export function parseFormula(content: string): LegacyVisualizationSuggestion[] {
  const normalized = normalizeMathText(content);
  const candidates: string[] = [];

  for (const match of normalized.matchAll(EQUATION_LINE)) {
    const left = takeLeadingMath(match[1] ?? '');
    const right = takeLeadingMath(match[2] ?? '');
    if (!left || !right) continue;
    if (/^[yY]$/.test(left) || /^\s*[fghpFGH]\s*\(\s*x\s*\)$/.test(left)) continue;
    const equation = `${left} = ${right}`;
    if (!/[0-9xXyY+\-*^]/.test(equation)) continue;
    candidates.push(equation);
  }

  if (candidates.length === 0) {
    const compact = takeLeadingMath(normalized);
    if (compact.includes('=') && compact.includes('x')) {
      const [left] = compact.split('=');
      if (left && evaluateEquation(left).ok) {
        candidates.push(compact);
      }
    }
  }

  if (candidates.length === 0) return [];

  const text = candidates[0];
  return [
    {
      intent: {
        type: 'formula',
        text,
      },
      confidence: 0.78,
      labelKey: 'visualize.actions.formula',
      summary: toDisplayMath(text),
    },
  ];
}
