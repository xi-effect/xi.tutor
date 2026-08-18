type SvgStaticTextProps = {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fill?: string;
  anchor?: 'start' | 'middle' | 'end';
  /** Смещение от базовой линии вместо dominantBaseline — тот стабильнее при transform камеры. */
  dy?: number | string;
};

/** Подпись в SVG, которая едет вместе с фигурой и не пересчитывается в экранные пиксели. */
export function SvgStaticText({
  x,
  y,
  text,
  fontSize,
  fill,
  anchor = 'start',
  dy,
}: SvgStaticTextProps) {
  return (
    <text
      x={x}
      y={y}
      dy={dy}
      textAnchor={anchor}
      fontSize={fontSize}
      fontFamily="system-ui, sans-serif"
      fontWeight={400}
      fill={fill}
      stroke="none"
      style={{ textRendering: 'geometricPrecision' }}
    >
      {text}
    </text>
  );
}
