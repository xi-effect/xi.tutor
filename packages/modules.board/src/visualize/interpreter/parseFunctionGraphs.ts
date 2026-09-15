import { evaluateEquation } from '../../shapes/coordinate-axes/utils/evaluateEquation';
import type { LegacyVisualizationSuggestion } from '../types';
import { normalizeMathText, takeLeadingMath } from './normalizeMathText';

const FUNCTION_ASSIGNMENT = /(?:^|[\s,;:.(!?[])((?:[yY]|[fghpFGH]\s*\(\s*x\s*\)))\s*=\s*([^\n=]+)/g;
const X_ASSIGNMENT = /(?:^|[\s,;:.(!?[])[xX]\s*=\s*([^\n=]+)/g;

function isValidPlotExpression(expression: string): boolean {
  return evaluateEquation(expression).ok;
}

function formatNumber(value: number): string {
  if (Math.abs(value - Math.round(value)) < 1e-10) return String(Math.round(value));
  return String(Number(value.toFixed(6)));
}

/** x = a·y + b → y = (x - b) / a, только для линейных выражений. */
function invertLinearInY(rhs: string): string | null {
  if (!/\by\b/i.test(rhs)) return null;
  const withoutY = rhs.replace(/\by\b/gi, ' ');
  if (/\bx\b/i.test(withoutY)) return null;

  const asFunctionOfX = rhs.replace(/\by\b/gi, 'x');
  const result = evaluateEquation(asFunctionOfX);
  if (!result.ok) return null;

  const f0 = result.evaluate(0);
  const f1 = result.evaluate(1);
  const f2 = result.evaluate(2);
  if (![f0, f1, f2].every(Number.isFinite)) return null;

  const slope = f1 - f0;
  if (Math.abs(slope - (f2 - f1)) > 1e-8) return null;
  if (Math.abs(slope) < 1e-10) return null;

  const intercept = f0;
  if (Math.abs(slope - 1) < 1e-10) {
    if (Math.abs(intercept) < 1e-10) return 'x';
    return intercept > 0 ? `x-${formatNumber(intercept)}` : `x+${formatNumber(-intercept)}`;
  }
  if (Math.abs(slope + 1) < 1e-10) {
    if (Math.abs(intercept) < 1e-10) return '-x';
    return `${formatNumber(intercept)}-x`;
  }
  if (Math.abs(intercept) < 1e-10) return `x/${formatNumber(slope)}`;
  return `(x-${formatNumber(intercept)})/${formatNumber(slope)}`;
}

export function parseFunctionGraphs(content: string): LegacyVisualizationSuggestion[] {
  const normalized = normalizeMathText(content);
  const expressions: string[] = [];
  const seen = new Set<string>();

  const addExpression = (expression: string) => {
    if (!expression || !isValidPlotExpression(expression) || seen.has(expression)) return;
    seen.add(expression);
    expressions.push(expression);
  };

  for (const match of normalized.matchAll(FUNCTION_ASSIGNMENT)) {
    addExpression(takeLeadingMath(match[2] ?? ''));
  }

  if (expressions.length === 0) {
    for (const match of normalized.matchAll(X_ASSIGNMENT)) {
      const rhs = takeLeadingMath(match[1] ?? '');
      const inverted = invertLinearInY(rhs);
      if (inverted) addExpression(inverted);
    }
  }

  if (expressions.length === 0) {
    for (const match of normalized.matchAll(/(?:^|\n)\s*([^\n=]{1,120})=\s*([^\n]{1,80})/g)) {
      const left = takeLeadingMath(match[1] ?? '');
      const right = takeLeadingMath(match[2] ?? '');
      if (!left || !right) continue;
      if (/^[yY]$/.test(left) || /^\s*[fghpFGH]\s*\(\s*x\s*\)$/.test(left)) continue;
      if (!isValidPlotExpression(left) || !isValidPlotExpression(right)) continue;
      const usesVariableX = (expression: string) =>
        /(?:^|[^a-z])x(?:[^a-z]|$)/i.test(expression.replace(/\s+/g, ''));
      if (!usesVariableX(left) && !usesVariableX(right)) continue;
      addExpression(left);
      addExpression(right);
      break;
    }
  }

  if (expressions.length === 0 && !normalized.includes('=')) {
    const standalone = takeLeadingMath(normalized);
    if (standalone && isValidPlotExpression(standalone)) {
      const compact = standalone.replace(/\s+/g, '');
      if (compact.includes('x') && /[+\-*/^]|sin|cos|tan|sqrt|log|ln|exp/.test(compact)) {
        addExpression(standalone);
      }
    }
  }

  if (expressions.length === 0) return [];

  const summary =
    expressions.length === 1
      ? `y = ${expressions[0]}`
      : expressions.map((expression) => `y = ${expression}`).join('\n');

  return [
    {
      intent: {
        type: 'function_graph',
        expressions,
        expression: expressions[0],
      },
      confidence: expressions.length === 1 ? 0.96 : 0.9,
      labelKey: 'visualize.actions.function_graph',
      summary,
    },
  ];
}
