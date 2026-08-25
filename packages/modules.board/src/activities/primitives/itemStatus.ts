import type { CheckStatus, ItemStatus } from '../model/types';

export function itemStatus(
  checkStatus: CheckStatus,
  byItem: Record<string, boolean>,
  id: string,
): ItemStatus {
  if (checkStatus === 'idle') return 'idle';
  if (byItem[id]) return 'correct';
  return 'wrong';
}
