import { useEffect, useState } from 'react';
import type * as Y from 'yjs';

export function useYMapVersion<T>(map: Y.Map<T>): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onChange = () => setVersion((v) => v + 1);
    map.observe(onChange);
    return () => map.unobserve(onChange);
  }, [map]);

  return version;
}
