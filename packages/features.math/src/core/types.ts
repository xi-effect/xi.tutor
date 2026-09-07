import type { GeometrySemanticModel } from '../geometry/semantic/types';

export type Confidence = number;

export type MathInput = {
  text: string;
  latex?: string;
  context?: {
    grade?: number;
    exam?: 'oge' | 'ege-basic' | 'ege-profile';
    topic?: string;
  };
};

export type VisualizationSuggestion<T = MathVisualizationIntent> = {
  id: string;
  label: string;
  confidence: Confidence;
  reason?: string;
  intent: T;
};

export type Point = { name?: string; x: number; y: number };

export type FunctionGraphIntent = {
  type: 'function_graph';
  expressions: Array<{ label?: string; expression: string }>;
  xRange?: [number, number];
  yRange?: [number, number];
};

export type CoordinatePointsIntent = {
  type: 'coordinate_points';
  points: Point[];
  connect?: boolean;
};

export type NumberLineIntent = {
  type: 'number_line';
  intervals: Array<{
    from: number | null;
    to: number | null;
    fromInclusive: boolean;
    toInclusive: boolean;
  }>;
};

export type FormulaIntent = {
  type: 'formula';
  source: string;
  latex?: string;
};

export type FractionModelIntent = {
  type: 'fraction_model';
  numerator: number;
  denominator: number;
  model: 'bar' | 'circle';
};

export type RatioIntent = {
  type: 'ratio';
  left: number;
  right: number;
};

export type PercentBarIntent = {
  type: 'percent_bar';
  percent: number;
  whole?: number;
  part?: number;
};

export type SequenceIntent = {
  type: 'sequence';
  values: number[];
  kind?: 'arithmetic' | 'geometric' | 'generic';
};

export type ProbabilityTreeIntent = {
  type: 'probability_tree';
  stages: number;
  outcomes: Array<{ label: string; probability?: number }>;
};

export type GeometryIntent = {
  type: 'geometry';
  model: GeometrySemanticModel;
};

export type DiagramIntent = {
  type: 'diagram';
  nodes: Array<{ id: string; label: string }>;
  edges: Array<{ from: string; to: string; label?: string }>;
};

export type TimelineIntent = {
  type: 'timeline';
  events: Array<{ year: number; label: string }>;
};

export type MathVisualizationIntent =
  | FunctionGraphIntent
  | CoordinatePointsIntent
  | NumberLineIntent
  | FormulaIntent
  | FractionModelIntent
  | RatioIntent
  | PercentBarIntent
  | SequenceIntent
  | ProbabilityTreeIntent
  | GeometryIntent
  | DiagramIntent
  | TimelineIntent;

export interface MathInterpreterModule {
  id: string;
  canInterpret(input: MathInput): number;
  interpret(input: MathInput): VisualizationSuggestion[];
}
