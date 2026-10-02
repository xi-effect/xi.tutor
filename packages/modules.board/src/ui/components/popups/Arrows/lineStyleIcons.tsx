const svgProps = {
  width: 28,
  height: 16,
  viewBox: '0 0 28 16',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
};

export const SolidLineIcon = () => (
  <svg {...svgProps}>
    <path d="M2 8 H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const DashedLineIcon = () => (
  <svg {...svgProps}>
    <path
      d="M2 8 H26"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="5 3"
    />
  </svg>
);

export const DottedLineIcon = () => (
  <svg {...svgProps}>
    <path
      d="M3 8 H25"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="0.1 4.5"
    />
  </svg>
);

export const SparseLineIcon = () => (
  <svg {...svgProps}>
    <path
      d="M2 8 H26"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 7"
    />
  </svg>
);

export const DoubleLineIcon = () => (
  <svg {...svgProps}>
    <path d="M2 5.5 H26" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M2 10.5 H26" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);
