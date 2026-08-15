import { describe, expect, it } from 'vitest';
import { isBoardStoreReady } from '../boardStoreStatus';

describe('isBoardStoreReady', () => {
  it('считает готовым локальный и удалённый sync', () => {
    expect(isBoardStoreReady('synced-local')).toBe(true);
    expect(isBoardStoreReady('synced-remote')).toBe(true);
  });

  it('не считает готовым loading / error / not-synced', () => {
    expect(isBoardStoreReady('loading')).toBe(false);
    expect(isBoardStoreReady('error')).toBe(false);
    expect(isBoardStoreReady('not-synced')).toBe(false);
    expect(isBoardStoreReady(undefined)).toBe(false);
  });
});
