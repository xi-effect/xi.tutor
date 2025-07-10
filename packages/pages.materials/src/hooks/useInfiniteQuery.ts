import { useEffect, useState, RefObject } from 'react';
import { useFetchMaterials } from 'common.services';
import { MaterialPropsT } from '../types';
import { MaterialsKindT } from 'common.api';

export const useInfiniteQuery = (
  parentRef: RefObject<HTMLDivElement | null>,
  kind: MaterialsKindT,
) => {
  const [items, setItems] = useState<MaterialPropsT[]>([]);
  const [lastOpenedBefore, setLastOpenedBefore] = useState<string | undefined>(undefined);
  const [fetchMore, setFetchMore] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const { data, isLoading } = useFetchMaterials(30, kind, lastOpenedBefore);

  useEffect(() => {
    if (!data || !fetchMore || isLoading) return;

    if (data.length === 0) {
      setFetchMore(false);
      return;
    }

    setItems((prev) => (isFirstLoad ? data : [...prev, ...data]));

    setLastOpenedBefore(data[data.length - 1].last_opened_at);
    setFetchMore(false);
    setIsFirstLoad(false);
  }, [data, fetchMore, isFirstLoad, isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      if (!parentRef.current || isLoading || fetchMore) return;

      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;

      if (scrollHeight - scrollTop - clientHeight < 100) {
        setFetchMore(true);
      }
    };

    const el = parentRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [parentRef, isLoading, fetchMore]);

  return items;
};
