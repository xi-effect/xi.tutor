import type { LegacyVisualizationSuggestion } from '../types';
import { normalizeMathText } from './normalizeMathText';

const BETWEEN =
  /(-?\d+(?:\.\d+)?)\s*(<=|<|≥|≤|>=|>)\s*[xXхХ]\s*(<=|<|≥|≤|>=|>)\s*(-?\d+(?:\.\d+)?)/;
const LEFT_X = /[xXхХ]\s*(<=|<|≥|≤|>=|>)\s*(-?\d+(?:\.\d+)?)/;
const RIGHT_X = /(-?\d+(?:\.\d+)?)\s*(<=|<|≥|≤|>=|>)\s*[xXхХ]/;

function isInclusive(operator: string): boolean {
  return operator === '<=' || operator === '>=' || operator === '≤' || operator === '≥';
}

function isLess(operator: string): boolean {
  return operator === '<' || operator === '<=' || operator === '≤';
}

export function parseNumberLine(content: string): LegacyVisualizationSuggestion[] {
  const normalized = normalizeMathText(content);

  const between = normalized.match(BETWEEN);
  if (between) {
    const startValue = Number(between[1]);
    const startOp = between[2];
    const endOp = between[3];
    const endValue = Number(between[4]);
    if (!Number.isFinite(startValue) || !Number.isFinite(endValue)) return [];

    return [
      {
        intent: {
          type: 'number_line',
          start: { value: startValue, inclusive: isInclusive(startOp) },
          end: { value: endValue, inclusive: isInclusive(endOp) },
        },
        confidence: 0.9,
        labelKey: 'visualize.actions.number_line',
        summary: `${startValue} ${startOp} x ${endOp} ${endValue}`,
      },
    ];
  }

  const left = normalized.match(LEFT_X);
  if (left) {
    const operator = left[1];
    const value = Number(left[2]);
    if (!Number.isFinite(value)) return [];
    const intent = isLess(operator)
      ? {
          type: 'number_line' as const,
          end: { value, inclusive: isInclusive(operator) },
          unboundedLeft: true,
        }
      : {
          type: 'number_line' as const,
          start: { value, inclusive: isInclusive(operator) },
          unboundedRight: true,
        };

    return [
      {
        intent,
        confidence: 0.88,
        labelKey: 'visualize.actions.number_line',
        summary: `x ${operator} ${value}`,
      },
    ];
  }

  const right = normalized.match(RIGHT_X);
  if (right) {
    const value = Number(right[1]);
    const operator = right[2];
    if (!Number.isFinite(value)) return [];
    const intent = isLess(operator)
      ? {
          type: 'number_line' as const,
          start: { value, inclusive: isInclusive(operator) },
          unboundedRight: true,
        }
      : {
          type: 'number_line' as const,
          end: { value, inclusive: isInclusive(operator) },
          unboundedLeft: true,
        };

    return [
      {
        intent,
        confidence: 0.88,
        labelKey: 'visualize.actions.number_line',
        summary: `${value} ${operator} x`,
      },
    ];
  }

  return [];
}
