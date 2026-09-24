import type {
  CoordinatePointsIntent as MathCoordinatePointsIntent,
  DiagramIntent as MathDiagramIntent,
  FormulaIntent as MathFormulaIntent,
  FunctionGraphIntent as MathFunctionGraphIntent,
  GeometryIntent as MathGeometryIntent,
  MathVisualizationIntent,
  NumberLineIntent as MathNumberLineIntent,
  TimelineIntent as MathTimelineIntent,
} from 'features.math';
import { toPlottableExpression } from './interpreter/normalizeMathText';
import type {
  CoordinatePointsIntent,
  DiagramIntent,
  FormulaIntent,
  FunctionGraphIntent,
  NumberLineIntent,
  TimelineIntent,
} from './intent/schemas';

export function mapFunctionGraphIntent(
  intent: MathFunctionGraphIntent,
): FunctionGraphIntent | null {
  const expressions = intent.expressions
    .map((item) => toPlottableExpression(item.expression))
    .filter((expression): expression is string => Boolean(expression));
  if (expressions.length === 0) return null;
  return {
    type: 'function_graph',
    expressions,
    expression: expressions[0],
    xRange: intent.xRange,
    yRange: intent.yRange,
  };
}

export function mapCoordinatePointsIntent(
  intent: MathCoordinatePointsIntent,
): CoordinatePointsIntent {
  return {
    type: 'coordinate_points',
    points: intent.points,
    connect: intent.connect,
  };
}

export function mapNumberLineIntent(intent: MathNumberLineIntent): NumberLineIntent {
  const interval = intent.intervals[0];
  return {
    type: 'number_line',
    start:
      interval?.from != null
        ? { value: interval.from, inclusive: interval.fromInclusive }
        : undefined,
    end: interval?.to != null ? { value: interval.to, inclusive: interval.toInclusive } : undefined,
    unboundedLeft: interval?.from == null,
    unboundedRight: interval?.to == null,
  };
}

export function mapFormulaIntent(intent: MathFormulaIntent): FormulaIntent {
  return {
    type: 'formula',
    text: intent.latex?.trim() || intent.source,
    latex: intent.latex,
  };
}

export function mapDiagramIntent(intent: MathDiagramIntent): DiagramIntent {
  return {
    type: 'diagram',
    nodes: intent.nodes,
    edges: intent.edges.map((edge) => ({ from: edge.from, to: edge.to })),
  };
}

export function mapTimelineIntent(intent: MathTimelineIntent): TimelineIntent {
  return {
    type: 'timeline',
    events: intent.events.map((event) => ({
      year: String(event.year),
      label: event.label,
    })),
  };
}

export function getGeometrySemanticModel(intent: MathGeometryIntent) {
  return intent.model;
}

export function getMathGraphExpressions(intent: MathVisualizationIntent): string[] {
  if (intent.type !== 'function_graph') return [];
  return intent.expressions.map((item) => item.expression).filter(Boolean);
}
