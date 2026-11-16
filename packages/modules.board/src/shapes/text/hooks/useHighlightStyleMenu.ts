import { useCallback, useEffect, useRef, useState } from 'react';

/** Открытие меню цвета по кисти. Закрывается при смене выделенного текста. */
export const useHighlightStyleMenu = (sourceId: string) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const sourceRef = useRef(sourceId);
  const ignoreSourceClose = useRef(false);
  openRef.current = open;

  const close = useCallback(() => setOpen(false), []);

  const toggle = useCallback(() => {
    if (openRef.current) {
      setOpen(false);
      return false;
    }

    ignoreSourceClose.current = true;
    setOpen(true);
    return true;
  }, []);

  useEffect(() => {
    const sourceChanged = sourceRef.current !== sourceId;
    sourceRef.current = sourceId;

    if (ignoreSourceClose.current) {
      ignoreSourceClose.current = false;
      return;
    }

    if (sourceChanged) setOpen(false);
  }, [sourceId, open]);

  return { open, toggle, close };
};
