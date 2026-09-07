import type { Editor } from '@ibodr/draw';
import { MathVisualInterpreter, type MathVisualizationIntent } from 'features.math';
import { VISUALIZE_MIN_CONFIDENCE } from './constants';
import { extractSelectedText } from './extractSelectedText';
import { normalizeMathText } from './interpreter/normalizeMathText';
import { canRenderMathIntent } from './renderers/mathRegistry';
import { normalizeUnicodeMathText } from '../shapes/text/utils/unicodeMath';
import type { VisualizationSuggestion } from './types';

const interpreter = new MathVisualInterpreter();

function summarize(intent: MathVisualizationIntent): string {
  switch (intent.type) {
    case 'function_graph':
      return intent.expressions.map((item) => item.expression).join('\n');
    case 'coordinate_points':
      return intent.points
        .map((point) => `${point.name ?? ''}(${point.x}; ${point.y})`.trim())
        .join(', ');
    case 'number_line':
      return intent.intervals
        .map((interval) => `${interval.from ?? '−∞'} … ${interval.to ?? '+∞'}`)
        .join('; ');
    case 'formula':
      return intent.latex || intent.source;
    case 'geometry':
      return intent.model.entities
        .filter((entity) => entity.type !== 'point' && entity.type !== 'segment')
        .map((entity) => entity.type)
        .join(', ');
    case 'fraction_model':
      return `${intent.numerator}/${intent.denominator}`;
    case 'ratio':
      return `${intent.left} : ${intent.right}`;
    case 'percent_bar':
      return `${intent.percent}%`;
    case 'sequence':
      return intent.values.join(', ');
    case 'probability_tree':
      return intent.outcomes.map((item) => item.label).join(', ');
    case 'diagram':
      return intent.nodes.map((node) => node.label).join(' → ');
    case 'timeline':
      return intent.events.map((event) => `${event.year}`).join(', ');
    default:
      return '';
  }
}

export function getVisualizationSuggestions(content: string): VisualizationSuggestion[] {
  const text = normalizeMathText(normalizeUnicodeMathText(content.trim()));
  if (!text) return [];

  const suggestions = interpreter
    .interpret({ text }, VISUALIZE_MIN_CONFIDENCE)
    .filter(
      (suggestion) =>
        suggestion.confidence >= VISUALIZE_MIN_CONFIDENCE && canRenderMathIntent(suggestion.intent),
    )
    .map((suggestion) => ({
      intent: suggestion.intent,
      confidence: suggestion.confidence,
      label: suggestion.label,
      summary: summarize(suggestion.intent),
    }));

  const hasFunctionGraph = suggestions.some((item) => item.intent.type === 'function_graph');
  return suggestions.filter(
    (suggestion) => suggestion.intent.type !== 'formula' || !hasFunctionGraph,
  );
}

export function getVisualizationSuggestionsForSelection(editor: Editor): VisualizationSuggestion[] {
  try {
    const { text } = extractSelectedText(editor);
    if (!text) return [];
    return getVisualizationSuggestions(text);
  } catch {
    return [];
  }
}
