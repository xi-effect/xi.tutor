import type { DrShape, DrShapeId, Editor } from '@ibodr/draw';
import type { MathVisualizationBoardAdapter, MathVisualizationIntent } from 'features.math';
import {
  COORDINATE_AXES_DEFAULT_HEIGHT,
  COORDINATE_AXES_DEFAULT_WIDTH,
} from '../../shapes/coordinate-axes/CoordinateAxesShape';
import { findFreePagePoint, getSourcePlacementPagePoint } from '../placeVisualization';
import { renderMathVisualizationIntent } from '../renderers/mathRegistry';
import { GEOMETRY_TARGET_SIZE, getGeometryScene } from '../renderers/geometryRenderer';
import type { VisualizationRenderContext } from '../renderers/types';

function estimateMathVisualizationSize(intent: MathVisualizationIntent): { w: number; h: number } {
  switch (intent.type) {
    case 'function_graph':
      return {
        w: COORDINATE_AXES_DEFAULT_WIDTH,
        h: COORDINATE_AXES_DEFAULT_HEIGHT,
      };
    case 'coordinate_points':
      return { w: COORDINATE_AXES_DEFAULT_WIDTH, h: COORDINATE_AXES_DEFAULT_HEIGHT };
    case 'number_line':
      return { w: 420, h: 100 };
    case 'diagram':
      return { w: Math.max(200, intent.nodes.length * 208), h: 80 };
    case 'timeline':
      return { w: Math.max(200, intent.events.length * 180), h: 100 };
    case 'geometry': {
      const scene = getGeometryScene(intent);
      return scene
        ? {
            w: scene.bounds.maxX + GEOMETRY_TARGET_SIZE.padding,
            h: scene.bounds.maxY + GEOMETRY_TARGET_SIZE.padding,
          }
        : { w: GEOMETRY_TARGET_SIZE.width, h: GEOMETRY_TARGET_SIZE.height };
    }
    case 'formula':
      return { w: 280, h: 48 };
    case 'fraction_model':
      return { w: Math.max(160, intent.denominator * 32), h: 80 };
    case 'ratio':
      return { w: 280, h: 80 };
    case 'percent_bar':
      return { w: 260, h: 70 };
    case 'sequence':
      return { w: Math.max(200, intent.values.length * 72), h: 60 };
    case 'probability_tree':
      return { w: 360, h: Math.max(120, intent.outcomes.length * 72) };
    default:
      return { w: 320, h: 240 };
  }
}

export class SovliumMathBoardAdapter implements MathVisualizationBoardAdapter {
  constructor(
    private readonly editor: Editor,
    private readonly source: DrShape,
  ) {}

  getInsertionPoint() {
    const size = { w: 320, h: 240 };
    const startPagePoint = getSourcePlacementPagePoint(this.editor, this.source.id) ?? {
      x: this.editor.getViewportPageBounds().center.x,
      y: this.editor.getViewportPageBounds().center.y,
    };
    const freePagePoint = findFreePagePoint(this.editor, startPagePoint, size.w, size.h, [
      this.source.id,
    ]);
    return this.editor.getPointInParentSpace(this.source.id, freePagePoint);
  }

  private context(position: { x: number; y: number }): VisualizationRenderContext {
    return {
      editor: this.editor,
      sourceShapeId: this.source.id,
      parentId: this.source.parentId,
      origin: position,
    };
  }

  private render(intent: MathVisualizationIntent, position: { x: number; y: number }): DrShapeId[] {
    return renderMathVisualizationIntent(intent, this.context(position)).createdShapeIds;
  }

  addFunctionGraph(input: Parameters<MathVisualizationBoardAdapter['addFunctionGraph']>[0]) {
    return this.render(
      {
        type: 'function_graph',
        expressions: input.expressions,
        xRange: input.xRange,
        yRange: input.yRange,
      },
      input.position,
    );
  }

  addCoordinatePlane(input: Parameters<MathVisualizationBoardAdapter['addCoordinatePlane']>[0]) {
    return this.render(
      { type: 'coordinate_points', points: input.points, connect: input.connect },
      input.position,
    );
  }

  addNumberLine(input: Parameters<MathVisualizationBoardAdapter['addNumberLine']>[0]) {
    const { position, ...intent } = input;
    return this.render(intent, position);
  }

  addFormula(input: Parameters<MathVisualizationBoardAdapter['addFormula']>[0]) {
    const { position, ...intent } = input;
    return this.render(intent, position);
  }

  addFractionModel(input: Parameters<MathVisualizationBoardAdapter['addFractionModel']>[0]) {
    const { position, ...intent } = input;
    return this.render(intent, position);
  }

  addRatio(input: Parameters<MathVisualizationBoardAdapter['addRatio']>[0]) {
    const { position, ...intent } = input;
    return this.render(intent, position);
  }

  addPercentBar(input: Parameters<MathVisualizationBoardAdapter['addPercentBar']>[0]) {
    const { position, ...intent } = input;
    return this.render(intent, position);
  }

  addSequence(input: Parameters<MathVisualizationBoardAdapter['addSequence']>[0]) {
    const { position, ...intent } = input;
    return this.render(intent, position);
  }

  addProbabilityTree(input: Parameters<MathVisualizationBoardAdapter['addProbabilityTree']>[0]) {
    const { position, ...intent } = input;
    return this.render(intent, position);
  }

  addGeometry(input: Parameters<MathVisualizationBoardAdapter['addGeometry']>[0]) {
    const { position, ...intent } = input;
    return this.render(intent, position);
  }

  addDiagram(input: Parameters<MathVisualizationBoardAdapter['addDiagram']>[0]) {
    const { position, ...intent } = input;
    return this.render(intent, position);
  }

  addTimeline(input: Parameters<MathVisualizationBoardAdapter['addTimeline']>[0]) {
    const { position, ...intent } = input;
    return this.render(intent, position);
  }

  renderIntent(intent: MathVisualizationIntent): DrShapeId[] {
    const size = estimateMathVisualizationSize(intent);
    const startPagePoint = getSourcePlacementPagePoint(this.editor, this.source.id) ?? {
      x: this.editor.getViewportPageBounds().center.x,
      y: this.editor.getViewportPageBounds().center.y,
    };
    const freePagePoint = findFreePagePoint(this.editor, startPagePoint, size.w, size.h, [
      this.source.id,
    ]);
    const origin = this.editor.getPointInParentSpace(this.source.id, freePagePoint);
    return this.render(intent, origin);
  }
}
