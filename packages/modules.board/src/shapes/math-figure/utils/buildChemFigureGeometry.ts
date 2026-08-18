import type {
  MathFigureEdge,
  MathFigureGeometry,
  MathFigureLabel,
  MathFigurePoint,
} from './buildMathFigureGeometry';
import { MATH_FIGURE_VISUAL } from './visualStyles';
import type { MathFigureKind } from './kinds';

function pt(x: number, y: number): MathFigurePoint {
  return { x, y };
}

function snap(n: number): number {
  return Math.round(n);
}

function edge(from: MathFigurePoint, to: MathFigurePoint): MathFigureEdge {
  return { from, to };
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

function atomLabel(p: MathFigurePoint, text: string): MathFigureLabel {
  return {
    x: snap(p.x),
    y: snap(p.y),
    text,
    anchor: 'middle',
    baseline: 'middle',
  };
}

function caption(
  p: MathFigurePoint,
  text: string,
  slot: 'above' | 'below' | 'left' | 'right',
): MathFigureLabel {
  const gap = 18;
  switch (slot) {
    case 'above':
      return { x: snap(p.x), y: snap(p.y - gap), text, anchor: 'middle', baseline: 'auto' };
    case 'below':
      return {
        x: snap(p.x),
        y: snap(p.y + gap * 0.35),
        text,
        anchor: 'middle',
        baseline: 'hanging',
      };
    case 'left':
      return { x: snap(p.x - gap), y: snap(p.y), text, anchor: 'end', baseline: 'middle' };
    case 'right':
      return { x: snap(p.x + gap), y: snap(p.y), text, anchor: 'start', baseline: 'middle' };
  }
}

function hypot(a: MathFigurePoint, b: MathFigurePoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y) || 1;
}

function shorten(
  a: MathFigurePoint,
  b: MathFigurePoint,
  inset: number = MATH_FIGURE_VISUAL.atomInset,
): MathFigureEdge {
  const len = hypot(a, b);
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  return edge(pt(a.x + ux * inset, a.y + uy * inset), pt(b.x - ux * inset, b.y - uy * inset));
}

function parallelBonds(a: MathFigurePoint, b: MathFigurePoint, gap = 3.5): MathFigureEdge[] {
  const len = hypot(a, b);
  const nx = (-(b.y - a.y) / len) * gap;
  const ny = ((b.x - a.x) / len) * gap;
  const a1 = pt(a.x + nx, a.y + ny);
  const b1 = pt(b.x + nx, b.y + ny);
  const a2 = pt(a.x - nx, a.y - ny);
  const b2 = pt(b.x - nx, b.y - ny);
  return [shorten(a1, b1), shorten(a2, b2)];
}

function arrow(from: MathFigurePoint, to: MathFigurePoint, head = 12): MathFigureEdge[] {
  const len = hypot(from, to);
  const ux = (to.x - from.x) / len;
  const uy = (to.y - from.y) / len;
  const px = -uy;
  const py = ux;
  const base = pt(to.x - ux * head, to.y - uy * head);
  return [
    edge(from, to),
    edge(pt(base.x + px * head * 0.45, base.y + py * head * 0.45), to),
    edge(pt(base.x - px * head * 0.45, base.y - py * head * 0.45), to),
  ];
}

function atAngle(origin: MathFigurePoint, length: number, deg: number): MathFigurePoint {
  const rad = (deg * Math.PI) / 180;
  return pt(origin.x + length * Math.cos(rad), origin.y + length * Math.sin(rad));
}

/** Пара электронов на оболочке (угол — направление от ядра). */
function electronPair(
  center: MathFigurePoint,
  radius: number,
  deg: number,
  spread = 4.5,
): MathFigurePoint[] {
  const rad = (deg * Math.PI) / 180;
  const mx = center.x + radius * Math.cos(rad);
  const my = center.y + radius * Math.sin(rad);
  const px = -Math.sin(rad) * spread;
  const py = Math.cos(rad) * spread;
  return [pt(mx + px, my + py), pt(mx - px, my - py)];
}

function electronDot(center: MathFigurePoint, radius: number, deg: number): MathFigurePoint {
  return atAngle(center, radius, deg);
}

function buildIonicBond(w: number, h: number, showLabels: boolean): MathFigureGeometry {
  const cy = h / 2 - 8;
  const na = pt(w * 0.28, cy);
  const cl = pt(w * 0.72, cy);
  const naShell = 34;
  const clShell = 40;
  const naElectron = electronDot(na, naShell, 0);

  return {
    ...emptyGeometry(),
    ellipses: [
      { cx: na.x, cy: na.y, rx: naShell, ry: naShell },
      { cx: cl.x, cy: cl.y, rx: clShell, ry: clShell },
    ],
    visibleEdges: arrow(pt(na.x + naShell + 10, cy - 26), pt(cl.x - clShell - 10, cy - 26)),
    extraDots: [
      naElectron,
      electronDot(cl, clShell, 180),
      ...electronPair(cl, clShell, 90),
      ...electronPair(cl, clShell, -90),
      ...electronPair(cl, clShell, 0),
    ],
    labels: showLabels
      ? [
          atomLabel(na, 'Na'),
          atomLabel(cl, 'Cl'),
          caption(naElectron, 'e⁻', 'above'),
          caption(na, 'Na⁺', 'below'),
          caption(cl, 'Cl⁻', 'below'),
        ]
      : [],
  };
}

function buildCovalentBond(w: number, h: number, showLabels: boolean): MathFigureGeometry {
  const cy = h / 2;
  const left = pt(w * 0.3, cy);
  const right = pt(w * 0.7, cy);
  const mid = pt(w / 2, cy);

  return {
    ...emptyGeometry(),
    extraDots: [pt(mid.x, mid.y - 6), pt(mid.x, mid.y + 6)],
    labels: showLabels ? [atomLabel(left, 'H'), atomLabel(right, 'H')] : [],
  };
}

function buildPolarBond(w: number, h: number, showLabels: boolean): MathFigureGeometry {
  const cy = h / 2 + 8;
  const left = pt(w * 0.28, cy);
  const right = pt(w * 0.72, cy);
  const dipoleFrom = pt(left.x + 18, cy + 36);
  const dipoleTo = pt(right.x - 18, cy + 36);
  const bar = 8;

  return {
    ...emptyGeometry(),
    visibleEdges: [
      shorten(left, right),
      ...arrow(dipoleFrom, dipoleTo),
      edge(pt(dipoleFrom.x, dipoleFrom.y - bar), pt(dipoleFrom.x, dipoleFrom.y + bar)),
    ],
    labels: showLabels
      ? [
          atomLabel(left, 'H'),
          atomLabel(right, 'Cl'),
          caption(left, 'δ+', 'above'),
          caption(right, 'δ−', 'above'),
        ]
      : [],
  };
}

function buildHydrogenBond(w: number, h: number, showLabels: boolean): MathFigureGeometry {
  const scale = Math.min(w, h) * 0.24;
  const leftO = pt(w * 0.28, h * 0.48);
  const leftHBond = atAngle(leftO, scale, 0);
  const leftHOther = atAngle(leftO, scale, -104.5);
  const rightO = atAngle(leftHBond, scale, 0);
  const rightH1 = atAngle(rightO, scale, -52.25);
  const rightH2 = atAngle(rightO, scale, 52.25);

  return {
    ...emptyGeometry(),
    visibleEdges: [
      shorten(leftO, leftHOther),
      shorten(leftO, leftHBond),
      shorten(rightO, rightH1),
      shorten(rightO, rightH2),
    ],
    hiddenEdges: [shorten(leftHBond, rightO, 14)],
    labels: showLabels
      ? [
          atomLabel(leftO, 'O'),
          atomLabel(leftHOther, 'H'),
          atomLabel(leftHBond, 'H'),
          atomLabel(rightO, 'O'),
          atomLabel(rightH1, 'H'),
          atomLabel(rightH2, 'H'),
        ]
      : [],
  };
}

function waterMolecule(
  origin: MathFigurePoint,
  scale: number,
): {
  O: MathFigurePoint;
  H1: MathFigurePoint;
  H2: MathFigurePoint;
} {
  const half = 104.5 / 2;
  return {
    O: origin,
    H1: atAngle(origin, scale, 90 - half),
    H2: atAngle(origin, scale, 90 + half),
  };
}

function buildWater(w: number, h: number, showLabels: boolean): MathFigureGeometry {
  const scale = Math.min(w, h) * 0.32;
  const { O, H1, H2 } = waterMolecule(pt(w / 2, h * 0.38), scale);

  return {
    ...emptyGeometry(),
    visibleEdges: [shorten(O, H1), shorten(O, H2)],
    labels: showLabels ? [atomLabel(O, 'O'), atomLabel(H1, 'H'), atomLabel(H2, 'H')] : [],
  };
}

function buildCarbonDioxide(w: number, h: number, showLabels: boolean): MathFigureGeometry {
  const cy = h / 2;
  const C = pt(w / 2, cy);
  const left = pt(w * 0.22, cy);
  const right = pt(w * 0.78, cy);

  return {
    ...emptyGeometry(),
    visibleEdges: [...parallelBonds(left, C), ...parallelBonds(C, right)],
    labels: showLabels ? [atomLabel(left, 'O'), atomLabel(C, 'C'), atomLabel(right, 'O')] : [],
  };
}

function buildMethane(w: number, h: number, showLabels: boolean): MathFigureGeometry {
  const C = pt(w / 2, h / 2);
  const arm = Math.min(w, h) * 0.28;
  const Hn = pt(C.x, C.y - arm);
  const Hs = pt(C.x, C.y + arm);
  const Hw = pt(C.x - arm, C.y);
  const He = pt(C.x + arm, C.y);

  return {
    ...emptyGeometry(),
    visibleEdges: [shorten(C, Hn), shorten(C, Hs), shorten(C, Hw), shorten(C, He)],
    labels: showLabels
      ? [
          atomLabel(C, 'C'),
          atomLabel(Hn, 'H'),
          atomLabel(Hs, 'H'),
          atomLabel(Hw, 'H'),
          atomLabel(He, 'H'),
        ]
      : [],
  };
}

function buildBenzene(w: number, h: number): MathFigureGeometry {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - MATH_FIGURE_VISUAL.figurePad * 0.55;
  const vertices = Array.from({ length: 6 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 3;
    return pt(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  });
  const sides = vertices.map((vertex, index) => edge(vertex, vertices[(index + 1) % 6]));

  return {
    ...emptyGeometry(),
    visibleEdges: sides,
    ellipses: [{ cx, cy, rx: r * 0.55, ry: r * 0.55 }],
  };
}

const CHEM_BUILDERS: Partial<
  Record<MathFigureKind, (w: number, h: number, showLabels: boolean) => MathFigureGeometry>
> = {
  'ionic-bond': buildIonicBond,
  'covalent-bond': buildCovalentBond,
  'polar-bond': buildPolarBond,
  'hydrogen-bond': buildHydrogenBond,
  water: buildWater,
  'carbon-dioxide': buildCarbonDioxide,
  methane: buildMethane,
  benzene: (w, h) => buildBenzene(w, h),
};

export function buildChemFigureGeometry(
  kind: MathFigureKind,
  w: number,
  h: number,
  showLabels: boolean,
): MathFigureGeometry | null {
  const builder = CHEM_BUILDERS[kind];
  return builder ? builder(w, h, showLabels) : null;
}
