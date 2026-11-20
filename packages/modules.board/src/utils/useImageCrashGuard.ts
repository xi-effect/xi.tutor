import { useEffect, useSyncExternalStore } from 'react';
import { imageCrashGuard } from './imageCrashGuard';

/** Была ли эта картинка на экране, когда прошлая сессия умерла. */
export function useIsCrashSuspect(assetId: string | null | undefined): boolean {
  useSyncExternalStore(imageCrashGuard.subscribe, imageCrashGuard.getVersion, () => 0);
  return assetId ? imageCrashGuard.isSuspect(assetId) : false;
}

/** Пока компонент смонтирован, картинка записана как «показывается». */
export function useTrackImageActive(assetId: string | null | undefined) {
  useEffect(() => {
    if (!assetId) return;
    imageCrashGuard.markActive(assetId);
    return () => imageCrashGuard.markInactive(assetId);
  }, [assetId]);
}
