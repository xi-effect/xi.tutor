import { useEffect } from 'react';
import { retainBlobUrl } from './resolveAssetUrl';

/** Пока URL в дереве, общий blob-кэш его не отзывает. */
export function useRetainedBlobUrl(url: string | null | undefined) {
  useEffect(() => retainBlobUrl(url), [url]);
}
