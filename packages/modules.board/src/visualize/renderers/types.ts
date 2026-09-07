import type { DrShape, DrShapeId, Editor } from '@ibodr/draw';
import type { VisualizationIntent } from '../intent/schemas';

export type VisualizationRenderContext = {
  editor: Editor;
  sourceShapeId: DrShapeId;
  parentId: DrShape['parentId'];
  origin: { x: number; y: number };
};

export type VisualizationRenderResult = {
  createdShapeIds: DrShapeId[];
};

export type VisualizationRenderer<T extends VisualizationIntent = VisualizationIntent> = {
  render(intent: T, context: VisualizationRenderContext): VisualizationRenderResult;
};
