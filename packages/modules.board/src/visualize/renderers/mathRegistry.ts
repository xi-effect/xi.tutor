import { solveGeometry, type MathVisualizationIntent } from 'features.math';
import { coordinatePointsRenderer } from './coordinatePointsRenderer';
import { diagramRenderer } from './diagramRenderer';
import { formulaRenderer } from './formulaRenderer';
import { functionGraphRenderer } from './functionGraphRenderer';
import { renderGeometryIntent } from './geometryRenderer';
import { numberLineRenderer } from './numberLineRenderer';
import { timelineRenderer } from './timelineRenderer';
import { renderFractionModel } from './fractionModelRenderer';
import { renderPercentBar } from './percentBarRenderer';
import { renderProbabilityTree } from './probabilityTreeRenderer';
import { renderRatio } from './ratioRenderer';
import { renderSequence } from './sequenceRenderer';
import type { VisualizationRenderContext, VisualizationRenderResult } from './types';
import {
  mapCoordinatePointsIntent,
  mapDiagramIntent,
  mapFormulaIntent,
  mapFunctionGraphIntent,
  mapNumberLineIntent,
  mapTimelineIntent,
} from '../mapMathIntent';

type MathIntentType = MathVisualizationIntent['type'];

type MathVisualizationRenderer<T extends MathIntentType> = (
  intent: Extract<MathVisualizationIntent, { type: T }>,
  context: VisualizationRenderContext,
) => VisualizationRenderResult;

function wrapMapped<T extends MathIntentType, B>(
  map: (intent: Extract<MathVisualizationIntent, { type: T }>) => B | null,
  render: (intent: B, context: VisualizationRenderContext) => VisualizationRenderResult,
): MathVisualizationRenderer<T> {
  return (intent, context) => {
    const mapped = map(intent);
    if (!mapped) return { createdShapeIds: [] };
    return render(mapped, context);
  };
}

export const mathVisualizationRenderers: {
  [K in MathIntentType]: MathVisualizationRenderer<K>;
} = {
  function_graph: wrapMapped(mapFunctionGraphIntent, (intent, context) =>
    functionGraphRenderer.render(intent, context),
  ),
  coordinate_points: wrapMapped(mapCoordinatePointsIntent, (intent, context) =>
    coordinatePointsRenderer.render(intent, context),
  ),
  number_line: wrapMapped(mapNumberLineIntent, (intent, context) =>
    numberLineRenderer.render(intent, context),
  ),
  formula: wrapMapped(mapFormulaIntent, (intent, context) =>
    formulaRenderer.render(intent, context),
  ),
  geometry: renderGeometryIntent,
  diagram: wrapMapped(mapDiagramIntent, (intent, context) =>
    diagramRenderer.render(intent, context),
  ),
  timeline: wrapMapped(mapTimelineIntent, (intent, context) =>
    timelineRenderer.render(intent, context),
  ),
  fraction_model: renderFractionModel,
  ratio: renderRatio,
  percent_bar: renderPercentBar,
  sequence: renderSequence,
  probability_tree: renderProbabilityTree,
};

export function canRenderMathIntent(intent: MathVisualizationIntent): boolean {
  if (intent.type === 'geometry') {
    return solveGeometry(intent.model).status !== 'unsatisfiable';
  }
  return Boolean(mathVisualizationRenderers[intent.type]);
}

export function renderMathVisualizationIntent(
  intent: MathVisualizationIntent,
  context: VisualizationRenderContext,
): VisualizationRenderResult {
  const renderer = mathVisualizationRenderers[intent.type] as MathVisualizationRenderer<
    typeof intent.type
  >;
  return renderer(intent, context);
}
