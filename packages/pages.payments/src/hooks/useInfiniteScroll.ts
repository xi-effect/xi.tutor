/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, RefObject } from 'react';
import { paymentsMock } from '../mocks';

export const useInfiniteScroll = (parentRef: RefObject<HTMLDivElement | null>) => {
  const [items, setItems] = useState(paymentsMock);

  useEffect(() => {
    const handleScroll = () => {
      if (!parentRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        setItems((prev: any) => [...prev, ...paymentsMock]);
      }
    };

    const scrollElement = parentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return items;
};
