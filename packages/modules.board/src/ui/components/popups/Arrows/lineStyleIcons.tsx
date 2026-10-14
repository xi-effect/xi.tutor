const svgProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
  className: 'size-6 shrink-0',
};

export const SolidLineIcon = () => (
  <svg {...svgProps}>
    <path d="M4 12 H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const DashedLineIcon = () => (
  <svg {...svgProps}>
    <path
      d="M4 12 H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 2.5"
    />
  </svg>
);

export const DottedLineIcon = () => (
  <svg {...svgProps}>
    <path
      d="M5 12 H19"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="0.1 4"
    />
  </svg>
);

export const SparseLineIcon = () => (
  <svg {...svgProps}>
    <path
      d="M4 12 H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="3 5"
    />
  </svg>
);

export const DashDotLineIcon = () => (
  <svg {...svgProps}>
    <path
      d="M4 12 H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="5 2 0.15 2"
    />
  </svg>
);

export const WavyLineIcon = () => (
  <svg {...svgProps}>
    <path
      d="M3 12 C5 6.5 7 6.5 9 12 S13 17.5 15 12 S19 6.5 21 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DoubleLineIcon = () => (
  <svg {...svgProps}>
    <path d="M4 9 H20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M4 15 H20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);
