import type { RefObject } from 'react';

export const FlipCardGhostMeasurer = ({
  ghostRef,
}: {
  ghostRef: RefObject<HTMLDivElement | null>;
}) => (
  <div
    ref={ghostRef}
    aria-hidden
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      visibility: 'hidden',
      pointerEvents: 'none',
      zIndex: -1,
      whiteSpace: 'pre-wrap',
      overflowWrap: 'break-word',
      wordBreak: 'break-word',
      textAlign: 'center',
      fontFamily: 'draw_draw, sans-serif',
    }}
  />
);
