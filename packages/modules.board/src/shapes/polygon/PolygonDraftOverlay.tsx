import { track, useEditor } from '@ibodr/draw';
import { usePolygonDraft } from './polygonDraft';
import type { Pt } from './polygonGeometry';

/** Предпросмотр строится только на экране и не пишет промежуточные фигуры в документ. */
export const PolygonDraftOverlay = track(function PolygonDraftOverlay() {
  const editor = useEditor();
  const draft = usePolygonDraft((state) => state.draft);
  if (!draft || draft.points.length === 0) return null;

  editor.getCamera();

  const toScreen = (point: Pt) => editor.pageToViewport(point);
  const screenPoints = draft.points.map(toScreen);
  const cursor = draft.cursor ? toScreen(draft.cursor) : null;
  const outline = cursor ? [...screenPoints, cursor] : screenPoints;
  const closed =
    (draft.kind === 'triangle' && draft.points.length >= 2 && cursor) ||
    (draft.kind === 'trapezoid' && draft.points.length >= 3 && cursor);
  const stroke = draft.valid ? 'var(--color-brand, #2563eb)' : '#dc2626';
  const guide = draft.guide ? { a: toScreen(draft.guide.a), b: toScreen(draft.guide.b) } : null;
  const path = outline
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      {guide ? (
        <line
          x1={guide.a.x}
          y1={guide.a.y}
          x2={guide.b.x}
          y2={guide.b.y}
          stroke={stroke}
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.55}
        />
      ) : null}
      <path
        d={`${path}${closed ? ' Z' : ''}`}
        fill={closed ? stroke : 'none'}
        fillOpacity={closed ? 0.16 : 0}
        stroke={stroke}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {screenPoints.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r={4} fill={stroke} />
      ))}
    </svg>
  );
});
