import type { MathVisualizationIntent } from '../core/types';

export type BoardPoint = { x: number; y: number };

/** Implement this interface against the actual sovlium board API. */
export interface MathVisualizationBoardAdapter {
  getInsertionPoint(): BoardPoint;

  addFunctionGraph(input: {
    expressions: Array<{ label?: string; expression: string }>;
    position: BoardPoint;
    xRange?: [number, number];
    yRange?: [number, number];
  }): Promise<string[]> | string[];

  addCoordinatePlane(input: {
    points: Array<{ name?: string; x: number; y: number }>;
    connect?: boolean;
    position: BoardPoint;
  }): Promise<string[]> | string[];

  addNumberLine(
    input: Extract<MathVisualizationIntent, { type: 'number_line' }> & { position: BoardPoint },
  ): Promise<string[]> | string[];
  addFormula(
    input: Extract<MathVisualizationIntent, { type: 'formula' }> & { position: BoardPoint },
  ): Promise<string[]> | string[];
  addFractionModel(
    input: Extract<MathVisualizationIntent, { type: 'fraction_model' }> & { position: BoardPoint },
  ): Promise<string[]> | string[];
  addRatio(
    input: Extract<MathVisualizationIntent, { type: 'ratio' }> & { position: BoardPoint },
  ): Promise<string[]> | string[];
  addPercentBar(
    input: Extract<MathVisualizationIntent, { type: 'percent_bar' }> & { position: BoardPoint },
  ): Promise<string[]> | string[];
  addSequence(
    input: Extract<MathVisualizationIntent, { type: 'sequence' }> & { position: BoardPoint },
  ): Promise<string[]> | string[];
  addProbabilityTree(
    input: Extract<MathVisualizationIntent, { type: 'probability_tree' }> & {
      position: BoardPoint;
    },
  ): Promise<string[]> | string[];
  addGeometry(
    input: Extract<MathVisualizationIntent, { type: 'geometry' }> & { position: BoardPoint },
  ): Promise<string[]> | string[];
  addDiagram(
    input: Extract<MathVisualizationIntent, { type: 'diagram' }> & { position: BoardPoint },
  ): Promise<string[]> | string[];
  addTimeline(
    input: Extract<MathVisualizationIntent, { type: 'timeline' }> & { position: BoardPoint },
  ): Promise<string[]> | string[];
}

export async function renderIntentOnBoard(
  adapter: MathVisualizationBoardAdapter,
  intent: MathVisualizationIntent,
) {
  const position = adapter.getInsertionPoint();
  switch (intent.type) {
    case 'function_graph':
      return adapter.addFunctionGraph({ ...intent, position });
    case 'coordinate_points':
      return adapter.addCoordinatePlane({ ...intent, position });
    case 'number_line':
      return adapter.addNumberLine({ ...intent, position });
    case 'formula':
      return adapter.addFormula({ ...intent, position });
    case 'fraction_model':
      return adapter.addFractionModel({ ...intent, position });
    case 'ratio':
      return adapter.addRatio({ ...intent, position });
    case 'percent_bar':
      return adapter.addPercentBar({ ...intent, position });
    case 'sequence':
      return adapter.addSequence({ ...intent, position });
    case 'probability_tree':
      return adapter.addProbabilityTree({ ...intent, position });
    case 'geometry':
      return adapter.addGeometry({ ...intent, position });
    case 'diagram':
      return adapter.addDiagram({ ...intent, position });
    case 'timeline':
      return adapter.addTimeline({ ...intent, position });
  }
}
