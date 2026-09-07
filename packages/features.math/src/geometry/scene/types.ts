export type ScenePoint = {
  id: string;
  x: number;
  y: number;
  label?: string;
};

export type SceneSegment = {
  id: string;
  from: string;
  to: string;
  kind?: 'segment' | 'line' | 'ray';
};

export type SceneCircle = {
  id: string;
  center: string;
  radius: number;
};

export type SceneMarker =
  | { type: 'right_angle'; points: [string, string, string] }
  | { type: 'equal_length'; segment: [string, string]; group: number }
  | { type: 'parallel'; segment: [string, string]; group: number }
  | { type: 'equal_angle'; points: [string, string, string]; group: number };

export type SceneLabel = {
  id: string;
  point: string;
  text: string;
  offset: { x: number; y: number };
};

export type SceneMeasurementLabel = {
  id: string;
  segment: [string, string];
  text: string;
};

export type SceneBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

export type GeometryScene = {
  points: ScenePoint[];
  segments: SceneSegment[];
  circles: SceneCircle[];
  markers: SceneMarker[];
  labels: SceneLabel[];
  measurementLabels?: SceneMeasurementLabel[];
  bounds: SceneBounds;
};
