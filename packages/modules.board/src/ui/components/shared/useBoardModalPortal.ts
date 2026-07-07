import { useEffect, useRef, useState } from 'react';

/** z-index портала модалок доски — выше канваса и оверлеев выделения. */
export const BOARD_MODAL_Z = 9999;

export function useBoardModalPortal() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    const el = document.createElement('div');
    el.style.position = 'relative';
    el.style.zIndex = String(BOARD_MODAL_Z);
    document.body.appendChild(el);
    containerRef.current = el;
    setPortalReady(true);

    return () => {
      document.body.removeChild(el);
      containerRef.current = null;
    };
  }, []);

  return {
    portalReady,
    portalContainer: containerRef.current,
  };
}
