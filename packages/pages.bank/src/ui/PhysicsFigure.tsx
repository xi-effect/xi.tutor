import type { PhysicsFigure as PhysicsFigureData } from 'features.bank';
import { useTranslation } from 'react-i18next';

type PhysicsFigureProps = {
  figure: PhysicsFigureData;
};

const GRAPH_WIDTH = 280;
const GRAPH_HEIGHT = 140;
const GRAPH_PAD = 16;

const graphPoint = (value: number, min: number, span: number, size: number, fromEnd = false) => {
  const ratio = (value - min) / span;
  return fromEnd
    ? size - GRAPH_PAD - ratio * (size - GRAPH_PAD * 2)
    : GRAPH_PAD + ratio * (size - GRAPH_PAD * 2);
};

export const PhysicsFigure = ({ figure }: PhysicsFigureProps) => {
  const { t } = useTranslation('mathBank');

  if (figure.kind === 'circuit') {
    return (
      <div className="border-border-default flex flex-col gap-2 rounded-xl border px-3 py-3">
        <p className="text-s-base text-text-secondary">
          {figure.connection === 'series' ? t('task.figureSeries') : t('task.figureParallel')}
        </p>
        <ul className="flex flex-col gap-1">
          {figure.resistors.map((resistor) => (
            <li key={resistor.label} className="text-s-base text-text-primary">
              {t('task.figureResistor', { label: resistor.label, value: resistor.resistanceOhm })}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const xs = figure.points.map((point) => point[0]);
  const ys = figure.points.map((point) => point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const path = figure.points
    .map((point, index) => {
      const x = graphPoint(point[0], minX, spanX, GRAPH_WIDTH).toFixed(1);
      const y = graphPoint(point[1], minY, spanY, GRAPH_HEIGHT, true).toFixed(1);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <figure className="border-border-default flex flex-col gap-2 rounded-xl border px-3 py-3">
      <svg
        viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
        className="text-text-primary h-36 w-full"
        role="img"
        aria-label={t('task.figureGraph', { x: figure.xLabel, y: figure.yLabel })}
      >
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <figcaption className="text-s-base text-text-secondary">
        {t('task.figureGraph', { x: figure.xLabel, y: figure.yLabel })}
      </figcaption>
    </figure>
  );
};
