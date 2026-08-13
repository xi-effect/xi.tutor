import type { DrStoreWithStatus } from '@ibodr/draw';

export function isBoardStoreReady(status: DrStoreWithStatus['status'] | undefined): boolean {
  return status === 'synced-local' || status === 'synced-remote';
}
