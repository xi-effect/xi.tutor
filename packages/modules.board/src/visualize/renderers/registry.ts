import type { VisualizationIntent, VisualizationIntentType } from '../intent/schemas';
import { coordinatePointsRenderer } from './coordinatePointsRenderer';
import { diagramRenderer } from './diagramRenderer';
import { formulaRenderer } from './formulaRenderer';
import { functionGraphRenderer } from './functionGraphRenderer';
import { numberLineRenderer } from './numberLineRenderer';
import { timelineRenderer } from './timelineRenderer';
import type { VisualizationRenderer } from './types';

export const visualizationRenderers: Partial<
  Record<VisualizationIntentType, VisualizationRenderer>
> = {
  function_graph: functionGraphRenderer as VisualizationRenderer,
  coordinate_points: coordinatePointsRenderer as VisualizationRenderer,
  formula: formulaRenderer as VisualizationRenderer,
  number_line: numberLineRenderer as VisualizationRenderer,
  diagram: diagramRenderer as VisualizationRenderer,
  timeline: timelineRenderer as VisualizationRenderer,
};

export function getVisualizationRenderer(
  type: VisualizationIntentType,
): VisualizationRenderer | undefined {
  return visualizationRenderers[type];
}

export function canRenderVisualizationIntent(intent: VisualizationIntent): boolean {
  return Boolean(visualizationRenderers[intent.type]);
}
