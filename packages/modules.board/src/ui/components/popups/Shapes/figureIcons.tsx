import type { SVGProps } from 'react';

const iconProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
  className: 'text-icon-primary size-6 shrink-0',
  'aria-hidden': true,
};

export function OvalIcon() {
  return (
    <svg {...iconProps}>
      <ellipse cx="12" cy="12" rx="9" ry="5.5" />
    </svg>
  );
}

export function PentagonIcon() {
  return (
    <svg {...iconProps}>
      <polygon points="12,3 21,10 17.5,21 6.5,21 3,10" />
    </svg>
  );
}

export function HexagonIcon() {
  return (
    <svg {...iconProps}>
      <polygon points="12,2.5 20.5,7 20.5,17 12,21.5 3.5,17 3.5,7" />
    </svg>
  );
}

export function OctagonIcon() {
  return (
    <svg {...iconProps}>
      <polygon points="8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8" />
    </svg>
  );
}

export function ParallelogramIcon() {
  return (
    <svg {...iconProps}>
      <polygon points="7,6 21,6 17,18 3,18" />
    </svg>
  );
}

export function Parallelogram2Icon() {
  return (
    <svg {...iconProps} className="text-icon-primary size-6 shrink-0 -scale-x-100">
      <polygon points="7,6 21,6 17,18 3,18" />
    </svg>
  );
}

export function CubeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 8h12v12H4z" />
      <path d="M8 4h12v12" />
      <path d="M4 8l4-4M16 8l4-4M16 20l4-4" />
    </svg>
  );
}

export function PyramidIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3 L21 19 L3 19 Z" />
      <path d="M12 3 L16 19" strokeDasharray="2 2" />
    </svg>
  );
}

export function CylinderIcon() {
  return (
    <svg {...iconProps}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6 v12" />
      <path d="M19 6 v12" />
      <path d="M5 18 a7 3 0 0 0 14 0" />
      <path d="M5 18 a7 3 0 0 1 14 0" strokeDasharray="2 2" />
    </svg>
  );
}

export function ConeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3 L19 17" />
      <path d="M12 3 L5 17" />
      <ellipse cx="12" cy="17" rx="7" ry="3" />
    </svg>
  );
}

export function NumberLineIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 12 H21" />
      <path d="M18 9 L21 12 L18 15" />
      <path d="M7 10 v4M12 10 v4M16 10 v4" />
    </svg>
  );
}

export function AxesIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 20 V5" />
      <path d="M4 20 H19" />
      <path d="M4 5 l-2 3 M4 5 l2 3" />
      <path d="M19 20 l-3 -2 M19 20 l-3 2" />
    </svg>
  );
}

export function VectorIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 12 H19" />
      <path d="M16 8 L20 12 L16 16" />
    </svg>
  );
}

export function TriangleElementsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 4 L20 19 H4 Z" />
      <path d="M12 4 V19" strokeDasharray="2 2" />
    </svg>
  );
}

export function IsoscelesTriangleIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 4 L20 19 H4 Z" />
      <path d="M12 4 V19" />
    </svg>
  );
}

export function CircleElementsIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12 H20" />
      <path d="M12 12 V4" />
    </svg>
  );
}

export function IonicBondIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="7" cy="12" r="4" />
      <circle cx="17" cy="12" r="5" />
      <path d="M11 8 H14" />
    </svg>
  );
}

export function CovalentBondIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="12" r="2.5" />
      <path d="M9 12 H15" />
    </svg>
  );
}

export function PolarBondIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 12 H19" />
      <path d="M16 9 L19 12 L16 15" />
    </svg>
  );
}

export function HydrogenBondIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 8 L8 14 L11 8" />
      <path d="M13 8 L16 14 L19 8" />
      <path d="M10 11 H14" strokeDasharray="2 2" />
    </svg>
  );
}

export function WaterIcon() {
  return (
    <svg {...iconProps}>
      <path d="M7 17 L12 7 L17 17" />
    </svg>
  );
}

export function CarbonDioxideIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 10 H10 M4 14 H10" />
      <path d="M14 10 H20 M14 14 H20" />
    </svg>
  );
}

export function MethaneIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 5 V19 M5 12 H19" />
    </svg>
  );
}

export function BenzeneIcon() {
  return (
    <svg {...iconProps}>
      <polygon points="12,3 20,8 20,16 12,21 4,16 4,8" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
