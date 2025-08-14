import { useState, useEffect } from 'react';

export const useSkeletonDelay = (minDelay: number = 200, maxDelay: number = 800) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [minDelay, maxDelay]);

  return shouldShow;
};
