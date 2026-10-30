import { DefaultBackground, useUniqueSafeId, type DrBackgroundProps } from '@ibodr/editor';
import { STAFF_BOARD_BACKGROUND_TYPE } from '../../../config';
import { useBoardBackgroundState } from '../../../hooks/useBoardBackground';

/** Расстояние между линейками стана, в координатах страницы при зуме 1. */
const STAFF_LINE_GAP = 16;
/** Просвет от последней линейки одного стана до первой линейки следующего. */
const STAFF_GAP = 80;
const STAFF_TILE = STAFF_LINE_GAP * 4 + STAFF_GAP;

function wrap(value: number, size: number) {
  return ((value % size) + size) % size;
}

function StaffPaperPattern({ y, z }: DrBackgroundProps) {
  const id = useUniqueSafeId('board-staff');
  const gap = STAFF_LINE_GAP * z;
  const tile = STAFF_TILE * z;
  const offset = wrap(0.5 + y * z, tile);

  return (
    <svg className="dr-background-pattern" aria-hidden="true">
      <defs>
        <pattern
          id={id}
          width={tile}
          height={tile}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(0, ${offset})`}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <line
              key={index}
              className="dr-bg-staff-line"
              x1={0}
              y1={index * gap}
              x2={tile}
              y2={index * gap}
            />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Фон доски: обычные узоры ядра и нотная бумага, которой в enum @ibodr нет. */
export function BoardCanvasBackground(props: DrBackgroundProps) {
  const { background } = useBoardBackgroundState();

  if (background.type !== STAFF_BOARD_BACKGROUND_TYPE) {
    return <DefaultBackground {...props} />;
  }

  return (
    <>
      <div className="dr-background" />
      <StaffPaperPattern {...props} />
    </>
  );
}
