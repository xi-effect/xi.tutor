import { projectDie } from './dice3d';
import type { DiceSides } from '../../dice/diceRoll';

type DiceSolidProps = {
  sides: DiceSides;
  value: number;
  seed: number;
  progress: number;
  size: number;
};

/** Объёмный кубик: грани рисуются проекцией, без CSS preserve-3d. */
export function DiceSolid({ sides, value, seed, progress, size }: DiceSolidProps) {
  const faces = projectDie(sides, value, seed, progress, size);
  const stroke = Math.max(1, size / 56);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      className="text-text-primary block overflow-visible"
    >
      {faces.map((face, index) => (
        <g key={`${face.value}-${index}`} opacity={face.opacity}>
          {face.circle ? (
            <circle
              cx={face.circle.cx}
              cy={face.circle.cy}
              r={face.circle.r}
              fill="var(--xi-brand-10)"
            />
          ) : (
            <polygon points={face.points} fill="var(--xi-brand-10)" />
          )}
          {face.circle ? (
            <circle
              cx={face.circle.cx}
              cy={face.circle.cy}
              r={face.circle.r}
              fill="var(--xi-brand-100)"
              opacity={face.shade}
            />
          ) : (
            <polygon points={face.points} fill="var(--xi-brand-100)" opacity={face.shade} />
          )}
          {face.stroke ? (
            face.circle ? (
              <circle
                cx={face.circle.cx}
                cy={face.circle.cy}
                r={face.circle.r}
                fill="none"
                stroke="var(--xi-brand-80)"
                strokeWidth={stroke}
              />
            ) : (
              <polygon
                points={face.points}
                fill="none"
                stroke="var(--xi-brand-80)"
                strokeWidth={stroke}
                strokeLinejoin="round"
              />
            )
          ) : null}
          {face.label ? (
            <text
              x={face.label.x}
              y={face.label.y}
              transform={`rotate(${face.label.rotate.toFixed(2)} ${face.label.x.toFixed(2)} ${face.label.y.toFixed(2)})`}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--xi-brand-100)"
              fontSize={face.label.size}
              fontWeight={600}
              fontFamily="inherit"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {face.label.text}
            </text>
          ) : null}
          {face.pips.map((pip) => (
            <circle
              key={`${pip.x}-${pip.y}`}
              cx={pip.x}
              cy={pip.y}
              r={pip.r}
              fill="var(--xi-brand-100)"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
