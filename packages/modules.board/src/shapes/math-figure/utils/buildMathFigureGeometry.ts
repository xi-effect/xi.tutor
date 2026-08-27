import type { MathFigureKind } from './kinds';
import { MATH_FIGURE_VISUAL } from './visualStyles';
import { buildChemFigureGeometry } from './buildChemFigureGeometry';

export type MathFigurePoint = { x: number; y: number };

export type MathFigureEdge = {
  from: MathFigurePoint;
  to: MathFigurePoint;
};

export type MathFigureEllipse = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

export type MathFigureArc = MathFigureEllipse & {
  start: MathFigurePoint;
  end: MathFigurePoint;
  sweep: 0 | 1;
};

export type MathFigureLabel = {
  x: number;
  y: number;
  text: string;
  anchor: 'start' | 'middle' | 'end';
  baseline: 'auto' | 'middle' | 'hanging';
};

export type MathFigureGeometry = {
  visibleEdges: MathFigureEdge[];
  hiddenEdges: MathFigureEdge[];
  heightEdges: MathFigureEdge[];
  medianEdges: MathFigureEdge[];
  bisectorEdges: MathFigureEdge[];
  ellipses: MathFigureEllipse[];
  visibleArcs: MathFigureArc[];
  hiddenArcs: MathFigureArc[];
  marks: MathFigurePoint[][];
  extraDots: MathFigurePoint[];
  labels: MathFigureLabel[];
};

export type MathFigureGeometryInput = {
  w: number;
  h: number;
  kind: MathFigureKind;
  showHiddenEdges: boolean;
  showLabels: boolean;
  showHeight: boolean;
  showMedian?: boolean;
  showBisector?: boolean;
};

function pt(x: number, y: number): MathFigurePoint {
  return { x, y };
}

function snapLabelCoord(n: number): number {
  return Math.round(n);
}

function edge(from: MathFigurePoint, to: MathFigurePoint): MathFigureEdge {
  return { from, to };
}

function centroid(points: MathFigurePoint[]): MathFigurePoint {
  const n = points.length || 1;
  return {
    x: points.reduce((sum, p) => sum + p.x, 0) / n,
    y: points.reduce((sum, p) => sum + p.y, 0) / n,
  };
}

function emptyGeometry(): MathFigureGeometry {
  return {
    visibleEdges: [],
    hiddenEdges: [],
    heightEdges: [],
    medianEdges: [],
    bisectorEdges: [],
    ellipses: [],
    visibleArcs: [],
    hiddenArcs: [],
    marks: [],
    extraDots: [],
    labels: [],
  };
}

/** Передняя дуга основания — нижняя (sweep=0), дальняя — верхняя (sweep=1). */
function ellipseFrontBackArcs(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  showHidden: boolean,
): Pick<MathFigureGeometry, 'visibleArcs' | 'hiddenArcs'> {
  const left = pt(cx - rx, cy);
  const right = pt(cx + rx, cy);
  const arc = (sweep: 0 | 1): MathFigureArc => ({
    cx,
    cy,
    rx,
    ry,
    start: left,
    end: right,
    sweep,
  });

  return {
    visibleArcs: [arc(0)],
    hiddenArcs: showHidden ? [arc(1)] : [],
  };
}

type LabelSlot =
  | 'left'
  | 'right'
  | 'above'
  | 'below'
  | 'above-left'
  | 'above-right'
  | 'below-left'
  | 'below-right';

function outsideLabel(p: MathFigurePoint, slot: LabelSlot, text: string): MathFigureLabel {
  const gap = MATH_FIGURE_VISUAL.labelOffset;
  const extraX = text.length > 1 ? 6 : 0;
  const x = p.x;
  const y = p.y;

  switch (slot) {
    case 'left':
      return {
        x: snapLabelCoord(x - gap - extraX),
        y: snapLabelCoord(y),
        text,
        anchor: 'end',
        baseline: 'middle',
      };
    case 'right':
      return {
        x: snapLabelCoord(x + gap + extraX),
        y: snapLabelCoord(y),
        text,
        anchor: 'start',
        baseline: 'middle',
      };
    case 'above':
      return {
        x: snapLabelCoord(x),
        y: snapLabelCoord(y - gap * 0.75),
        text,
        anchor: 'middle',
        baseline: 'auto',
      };
    case 'below':
      return {
        x: snapLabelCoord(x),
        y: snapLabelCoord(y + gap * 0.35),
        text,
        anchor: 'middle',
        baseline: 'hanging',
      };
    case 'above-left':
      return {
        x: snapLabelCoord(x - gap - extraX),
        y: snapLabelCoord(y - gap * 0.7),
        text,
        anchor: 'end',
        baseline: 'auto',
      };
    case 'above-right':
      return {
        x: snapLabelCoord(x + gap + extraX),
        y: snapLabelCoord(y - gap * 0.7),
        text,
        anchor: 'start',
        baseline: 'auto',
      };
    case 'below-left':
      return {
        x: snapLabelCoord(x - gap - extraX),
        y: snapLabelCoord(y + gap * 0.3),
        text,
        anchor: 'end',
        baseline: 'hanging',
      };
    case 'below-right':
      return {
        x: snapLabelCoord(x + gap + extraX),
        y: snapLabelCoord(y + gap * 0.3),
        text,
        anchor: 'start',
        baseline: 'hanging',
      };
  }
}

function sideLabel(p: MathFigurePoint, text: string): MathFigureLabel {
  return outsideLabel(p, 'right', text);
}

function dist(a: MathFigurePoint, b: MathFigurePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: MathFigurePoint, b: MathFigurePoint): MathFigurePoint {
  return pt((a.x + b.x) / 2, (a.y + b.y) / 2);
}

function lerp(a: MathFigurePoint, b: MathFigurePoint, t: number): MathFigurePoint {
  return pt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
}

function projectToLine(
  point: MathFigurePoint,
  a: MathFigurePoint,
  b: MathFigurePoint,
): MathFigurePoint {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const len2 = abx * abx + aby * aby || 1;
  const t = ((point.x - a.x) * abx + (point.y - a.y) * aby) / len2;
  return pt(a.x + t * abx, a.y + t * aby);
}

function angleBisectorFoot(
  A: MathFigurePoint,
  B: MathFigurePoint,
  C: MathFigurePoint,
): MathFigurePoint {
  const ab = dist(A, B);
  const ac = dist(A, C);
  return lerp(B, C, ab / (ab + ac));
}

function rightAngleMark(
  vertex: MathFigurePoint,
  towardsA: MathFigurePoint,
  towardsB: MathFigurePoint,
): MathFigurePoint[] {
  const size = MATH_FIGURE_VISUAL.rightAngleSize;
  const ax = towardsA.x - vertex.x;
  const ay = towardsA.y - vertex.y;
  const bx = towardsB.x - vertex.x;
  const by = towardsB.y - vertex.y;
  const alen = Math.hypot(ax, ay) || 1;
  const blen = Math.hypot(bx, by) || 1;
  const ux = (ax / alen) * size;
  const uy = (ay / alen) * size;
  const vx = (bx / blen) * size;
  const vy = (by / blen) * size;
  return [
    pt(vertex.x + ux, vertex.y + uy),
    pt(vertex.x + ux + vx, vertex.y + uy + vy),
    pt(vertex.x + vx, vertex.y + vy),
  ];
}

function buildCube(
  w: number,
  h: number,
  showHidden: boolean,
  showLabels: boolean,
): MathFigureGeometry {
  const pad = MATH_FIGURE_VISUAL.figurePad;
  const depth = Math.min(w, h) * 0.32;
  const frontW = Math.max(24, w - depth - pad * 2);
  const frontH = Math.max(24, h - depth - pad * 2);
  const ox = pad;
  const oy = pad + depth;

  const A = pt(ox, oy);
  const B = pt(ox + frontW, oy);
  const C = pt(ox + frontW, oy + frontH);
  const D = pt(ox, oy + frontH);
  const A1 = pt(A.x + depth, A.y - depth);
  const B1 = pt(B.x + depth, B.y - depth);
  const C1 = pt(C.x + depth, C.y - depth);
  const D1 = pt(D.x + depth, D.y - depth);

  return {
    ...emptyGeometry(),
    visibleEdges: [
      edge(A, B),
      edge(B, C),
      edge(C, D),
      edge(D, A),
      edge(A, A1),
      edge(B, B1),
      edge(C, C1),
      edge(A1, B1),
      edge(B1, C1),
    ],
    hiddenEdges: showHidden ? [edge(D, D1), edge(D1, C1), edge(A1, D1)] : [],
    labels: showLabels
      ? [
          outsideLabel(A, 'left', 'A'),
          outsideLabel(B, 'right', 'B'),
          outsideLabel(C, 'below-right', 'C'),
          outsideLabel(D, 'below-left', 'D'),
          outsideLabel(A1, 'above', 'A₁'),
          outsideLabel(B1, 'above-right', 'B₁'),
          outsideLabel(C1, 'right', 'C₁'),
          outsideLabel(D1, 'left', 'D₁'),
        ]
      : [],
  };
}

function buildPyramid(
  w: number,
  h: number,
  showHidden: boolean,
  showLabels: boolean,
  showHeight: boolean,
): MathFigureGeometry {
  const pad = MATH_FIGURE_VISUAL.figurePad;
  const depth = Math.min(w, h) * 0.28;
  const S = pt(w / 2, pad);
  const A = pt(pad, h - pad);
  const B = pt(w - pad - depth, h - pad);
  const C = pt(w - pad, h - pad - depth);
  const D = pt(pad + depth, h - pad - depth);
  const O = centroid([A, B, C, D]);

  return {
    ...emptyGeometry(),
    visibleEdges: [edge(S, A), edge(S, B), edge(S, C), edge(A, B), edge(B, C), edge(A, D)],
    hiddenEdges: showHidden ? [edge(S, D), edge(D, C)] : [],
    heightEdges: showHeight ? [edge(S, O)] : [],
    labels: showLabels
      ? [
          outsideLabel(S, 'above', 'S'),
          outsideLabel(A, 'below-left', 'A'),
          outsideLabel(B, 'below-right', 'B'),
          outsideLabel(C, 'above-right', 'C'),
          outsideLabel(D, 'left', 'D'),
          ...(showHeight ? [outsideLabel(O, 'below-right', 'H')] : []),
        ]
      : [],
  };
}

function buildCylinder(
  w: number,
  h: number,
  showHidden: boolean,
  showLabels: boolean,
): MathFigureGeometry {
  const pad = MATH_FIGURE_VISUAL.figurePad;
  const rx = Math.max(16, (w - pad * 2) / 2);
  const ry = Math.max(8, Math.min(rx * 0.36, (h - pad * 2) * 0.16));
  const cx = w / 2;
  const topCy = pad + ry;
  const bottomCy = h - pad - ry;
  const leftTop = pt(cx - rx, topCy);
  const rightTop = pt(cx + rx, topCy);
  const leftBottom = pt(cx - rx, bottomCy);
  const rightBottom = pt(cx + rx, bottomCy);

  return {
    ...emptyGeometry(),
    visibleEdges: [edge(leftTop, leftBottom), edge(rightTop, rightBottom)],
    ellipses: [{ cx, cy: topCy, rx, ry }],
    ...ellipseFrontBackArcs(cx, bottomCy, rx, ry, showHidden),
    labels: showLabels ? [sideLabel(pt(cx, topCy), 'O₁'), sideLabel(pt(cx, bottomCy), 'O')] : [],
  };
}

function buildCone(
  w: number,
  h: number,
  showHidden: boolean,
  showLabels: boolean,
  showHeight: boolean,
): MathFigureGeometry {
  const pad = MATH_FIGURE_VISUAL.figurePad;
  const rx = Math.max(16, (w - pad * 2) / 2);
  const ry = Math.max(8, Math.min(rx * 0.36, (h - pad * 2) * 0.16));
  const cx = w / 2;
  const S = pt(cx, pad);
  const baseCy = h - pad - ry;
  const left = pt(cx - rx, baseCy);
  const right = pt(cx + rx, baseCy);
  const O = pt(cx, baseCy);

  return {
    ...emptyGeometry(),
    visibleEdges: [edge(S, left), edge(S, right)],
    heightEdges: showHeight ? [edge(S, O)] : [],
    ...ellipseFrontBackArcs(cx, baseCy, rx, ry, showHidden),
    labels: showLabels ? [outsideLabel(S, 'above', 'S'), sideLabel(O, 'O')] : [],
  };
}

function buildTriangle(
  w: number,
  h: number,
  showLabels: boolean,
  showHeight: boolean,
  showMedian: boolean,
  showBisector: boolean,
): MathFigureGeometry {
  const pad = MATH_FIGURE_VISUAL.figurePad;
  const A = pt(pad + (w - pad * 2) * 0.32, pad);
  const B = pt(pad, h - pad);
  const C = pt(w - pad, h - pad);
  const H = pt(A.x, B.y);
  const M = midpoint(B, C);
  const L = angleBisectorFoot(A, B, C);

  return {
    ...emptyGeometry(),
    visibleEdges: [edge(A, B), edge(B, C), edge(C, A)],
    heightEdges: showHeight ? [edge(A, H)] : [],
    medianEdges: showMedian ? [edge(A, M)] : [],
    bisectorEdges: showBisector ? [edge(A, L)] : [],
    marks: showHeight ? [rightAngleMark(H, A, C)] : [],
    labels: showLabels
      ? [
          outsideLabel(A, 'above', 'A'),
          outsideLabel(B, 'below-left', 'B'),
          outsideLabel(C, 'below-right', 'C'),
          ...(showHeight ? [outsideLabel(H, 'below', 'H')] : []),
          ...(showMedian ? [outsideLabel(M, 'below', 'M')] : []),
          ...(showBisector ? [outsideLabel(L, 'below', 'L')] : []),
        ]
      : [],
  };
}

function buildRightTriangle(
  w: number,
  h: number,
  showLabels: boolean,
  showHeight: boolean,
): MathFigureGeometry {
  const pad = MATH_FIGURE_VISUAL.figurePad;
  const A = pt(pad, pad);
  const C = pt(pad, h - pad);
  const B = pt(w - pad, h - pad);
  const H = projectToLine(C, A, B);

  return {
    ...emptyGeometry(),
    visibleEdges: [edge(A, C), edge(C, B), edge(B, A)],
    heightEdges: showHeight ? [edge(C, H)] : [],
    marks: [rightAngleMark(C, A, B), ...(showHeight ? [rightAngleMark(H, C, B)] : [])],
    labels: showLabels
      ? [
          outsideLabel(A, 'above-left', 'A'),
          outsideLabel(B, 'below-right', 'B'),
          outsideLabel(C, 'below-left', 'C'),
          ...(showHeight ? [outsideLabel(H, 'above-right', 'H')] : []),
        ]
      : [],
  };
}

function buildIsoscelesTriangle(
  w: number,
  h: number,
  showLabels: boolean,
  showHeight: boolean,
): MathFigureGeometry {
  const pad = MATH_FIGURE_VISUAL.figurePad;
  const A = pt(w / 2, pad);
  const B = pt(pad, h - pad);
  const C = pt(w - pad, h - pad);
  const H = midpoint(B, C);

  return {
    ...emptyGeometry(),
    visibleEdges: [edge(A, B), edge(B, C), edge(C, A)],
    heightEdges: showHeight ? [edge(A, H)] : [],
    marks: showHeight ? [rightAngleMark(H, A, C)] : [],
    labels: showLabels
      ? [
          outsideLabel(A, 'above', 'A'),
          outsideLabel(B, 'below-left', 'B'),
          outsideLabel(C, 'below-right', 'C'),
          ...(showHeight ? [outsideLabel(H, 'below', 'H')] : []),
        ]
      : [],
  };
}

function buildRectangle(w: number, h: number, showLabels: boolean): MathFigureGeometry {
  const pad = MATH_FIGURE_VISUAL.figurePad;
  const A = pt(pad, pad);
  const B = pt(w - pad, pad);
  const C = pt(w - pad, h - pad);
  const D = pt(pad, h - pad);
  const O = midpoint(A, C);

  return {
    ...emptyGeometry(),
    visibleEdges: [edge(A, B), edge(B, C), edge(C, D), edge(D, A), edge(A, C), edge(B, D)],
    marks: [rightAngleMark(D, A, C)],
    extraDots: [O],
    labels: showLabels
      ? [
          outsideLabel(A, 'above-left', 'A'),
          outsideLabel(B, 'above-right', 'B'),
          outsideLabel(C, 'below-right', 'C'),
          outsideLabel(D, 'below-left', 'D'),
          outsideLabel(O, 'below', 'O'),
        ]
      : [],
  };
}

function buildCircle(w: number, h: number, showLabels: boolean): MathFigureGeometry {
  const pad = MATH_FIGURE_VISUAL.figurePad;
  const rx = Math.max(16, (w - pad * 2) / 2);
  const ry = Math.max(16, (h - pad * 2) / 2);
  const r = Math.min(rx, ry);
  const O = pt(w / 2, h / 2);
  const A = pt(O.x, O.y - r);
  const B = pt(O.x - r, O.y);
  const C = pt(O.x + r, O.y);

  return {
    ...emptyGeometry(),
    ellipses: [{ cx: O.x, cy: O.y, rx: r, ry: r }],
    visibleEdges: [edge(B, C), edge(O, A)],
    extraDots: [O],
    labels: showLabels
      ? [
          outsideLabel(O, 'below-right', 'O'),
          outsideLabel(A, 'above', 'A'),
          outsideLabel(B, 'left', 'B'),
          outsideLabel(C, 'right', 'C'),
        ]
      : [],
  };
}

function buildNumberLine(w: number, h: number, showLabels: boolean): MathFigureGeometry {
  const padX = 24;
  const y = Math.round(h * 0.42);
  const x1 = padX;
  const x2 = w - padX;
  const min = -5;
  const max = 5;
  const span = max - min;
  const ticks: MathFigureEdge[] = [];
  const labels: MathFigureLabel[] = [];

  for (let value = min; value <= max; value += 1) {
    const t = (value - min) / span;
    const x = snapLabelCoord(x1 + t * (x2 - x1 - 12));
    ticks.push(
      edge(
        pt(x, y - MATH_FIGURE_VISUAL.tickLength / 2),
        pt(x, y + MATH_FIGURE_VISUAL.tickLength / 2),
      ),
    );
    if (showLabels) {
      labels.push({
        x,
        y: y + MATH_FIGURE_VISUAL.tickLength + 16,
        text: String(value),
        anchor: 'middle',
        baseline: 'hanging',
      });
    }
  }

  const arrow = [edge(pt(x2 - 12, y - 5), pt(x2, y)), edge(pt(x2 - 12, y + 5), pt(x2, y))];

  return {
    ...emptyGeometry(),
    visibleEdges: [edge(pt(x1, y), pt(x2, y)), ...ticks, ...arrow],
    labels,
  };
}

export function buildMathFigureGeometry(input: MathFigureGeometryInput): MathFigureGeometry {
  const w = Math.max(1, Math.round(input.w));
  const h = Math.max(1, Math.round(input.h));
  const { kind, showHiddenEdges, showLabels, showHeight } = input;
  const showMedian = input.showMedian ?? false;
  const showBisector = input.showBisector ?? false;

  switch (kind) {
    case 'cube':
      return buildCube(w, h, showHiddenEdges, showLabels);
    case 'pyramid':
      return buildPyramid(w, h, showHiddenEdges, showLabels, showHeight);
    case 'cylinder':
      return buildCylinder(w, h, showHiddenEdges, showLabels);
    case 'cone':
      return buildCone(w, h, showHiddenEdges, showLabels, showHeight);
    case 'number-line':
      return buildNumberLine(w, h, showLabels);
    case 'triangle':
      return buildTriangle(w, h, showLabels, showHeight, showMedian, showBisector);
    case 'right-triangle':
      return buildRightTriangle(w, h, showLabels, showHeight);
    case 'isosceles-triangle':
      return buildIsoscelesTriangle(w, h, showLabels, showHeight);
    case 'rectangle':
      return buildRectangle(w, h, showLabels);
    case 'circle':
      return buildCircle(w, h, showLabels);
    default: {
      const chem = buildChemFigureGeometry(kind, w, h, showLabels);
      return chem ?? emptyGeometry();
    }
  }
}

export function arcPath(arc: MathFigureArc): string {
  return `M ${arc.start.x} ${arc.start.y} A ${arc.rx} ${arc.ry} 0 0 ${arc.sweep} ${arc.end.x} ${arc.end.y}`;
}
