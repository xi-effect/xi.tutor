export type LayoutBox = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type LayoutFrame = {
  frame: LayoutBox;
  children: LayoutBox[];
};

const box = (id: string, x: number, y: number, w: number, h: number): LayoutBox => ({
  id,
  x,
  y,
  w,
  h,
});

/** Координаты верхнего уровня — на странице, дочерние — внутри рамки. */
export const demoBoardLayout = {
  welcome: {
    frame: box('welcome', 48, 48, 780, 440),
    children: [
      box('welcome-title', 32, 32, 560, 64),
      box('welcome-emoji', 680, 32, 72, 72),
      box('welcome-body', 32, 140, 716, 160),
      box('welcome-hint', 32, 332, 716, 72),
    ],
  },
  elements: {
    frame: box('elements', 864, 48, 960, 820),
    children: [
      box('elements-title', 32, 28, 860, 56),
      box('rectangle', 32, 124, 210, 120),
      box('ellipse', 390, 124, 150, 120),
      box('sticker-a', 32, 300, 200, 200),
      box('sticker-b', 272, 300, 200, 200),
      box('flip-card', 600, 300, 160, 260),
      box('elements-emoji', 800, 360, 80, 80),
      box('elements-hint', 32, 600, 896, 170),
    ],
  },
  workflow: {
    frame: box('workflow', 48, 524, 780, 540),
    children: [
      box('workflow-title', 32, 28, 700, 56),
      box('workflow-intro', 32, 116, 700, 88),
      box('idea', 32, 236, 140, 110),
      box('plan', 212, 236, 140, 110),
      box('lesson', 392, 236, 140, 110),
      box('result', 572, 236, 140, 110),
      box('workflow-hint', 32, 386, 700, 120),
    ],
  },
  activity: box('activity', 864, 904, 480, 360),
  pdf: {
    frame: box('pdf', 1860, 48, 680, 1000),
    children: [
      box('pdf-title', 24, 24, 632, 48),
      box('pdf-file', 24, 104, 632, 760),
      box('pdf-hint', 24, 896, 632, 72),
    ],
  },
} as const;

export const demoBoardTopLevelBoxes = (): LayoutBox[] => [
  demoBoardLayout.welcome.frame,
  demoBoardLayout.elements.frame,
  demoBoardLayout.workflow.frame,
  demoBoardLayout.activity,
  demoBoardLayout.pdf.frame,
];

const separated = (a: LayoutBox, b: LayoutBox, minGap: number): boolean =>
  a.x + a.w + minGap <= b.x ||
  b.x + b.w + minGap <= a.x ||
  a.y + a.h + minGap <= b.y ||
  b.y + b.h + minGap <= a.y;

export const layoutOverlaps = (boxes: readonly LayoutBox[], minGap: number): string[] => {
  const hits: string[] = [];
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const left = boxes[i];
      const right = boxes[j];
      if (!left || !right || separated(left, right, minGap)) continue;
      hits.push(`${left.id}:${right.id}`);
    }
  }
  return hits;
};

export const layoutOverflows = (
  frame: LayoutBox,
  children: readonly LayoutBox[],
  inset: number,
): string[] =>
  children
    .filter(
      (child) =>
        child.x < inset ||
        child.y < inset ||
        child.x + child.w > frame.w - inset ||
        child.y + child.h > frame.h - inset,
    )
    .map((child) => child.id);
